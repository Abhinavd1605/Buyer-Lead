import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { demoAuthenticate, AuthenticatedRequest } from '../utils/auth';
import { apiLimiter, createUpdateLimiter, importLimiter } from '../middleware/rateLimiter';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { BuyerCreateSchema, BuyerUpdateSchema, BuyerFiltersSchema } from '../validators';
import { BuyerFilters, PaginatedResponse, ApiResponse, CSVImportResult } from '../types';
import { parseCSV, validateCSVRow, generateCSV } from '../utils/csv';
import prisma from '../utils/db';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Apply authentication to all routes
router.use(demoAuthenticate);

// GET /buyers - List buyers with pagination and filters
router.get('/', apiLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const filters = BuyerFiltersSchema.parse(req.query);
  
  const where: any = {};
  
  // Apply filters
  if (filters.city) where.city = filters.city;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.status) where.status = filters.status;
  if (filters.timeline) where.timeline = filters.timeline;
  
  // Apply search
  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ];
  }
  
  // Calculate pagination
  const skip = (filters.page - 1) * filters.limit;
  
  // Get total count
  const total = await prisma.buyer.count({ where });
  
  // Get buyers
  const buyers = await prisma.buyer.findMany({
    where,
    skip,
    take: filters.limit,
    orderBy: {
      [filters.sortBy]: filters.sortOrder
    },
    include: {
      owner: {
        select: { fullName: true, email: true }
      }
    }
  });
  
  const response: ApiResponse<PaginatedResponse<typeof buyers[0]>> = {
    success: true,
    data: {
      data: buyers,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit)
      }
    }
  };
  
  res.json(response);
}));

// GET /buyers/:id - Get specific buyer
router.get('/:id', apiLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const buyer = await prisma.buyer.findUnique({
    where: { id: req.params.id },
    include: {
      owner: {
        select: { fullName: true, email: true }
      },
      history: {
        take: 5,
        orderBy: { changedAt: 'desc' },
        include: {
          user: {
            select: { fullName: true, email: true }
          }
        }
      }
    }
  });
  
  if (!buyer) {
    throw createError('Buyer not found', 404);
  }
  
  const response: ApiResponse<typeof buyer> = {
    success: true,
    data: buyer
  };
  
  res.json(response);
}));

// POST /buyers - Create new buyer
router.post('/', createUpdateLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = BuyerCreateSchema.parse(req.body);
  
  const buyer = await prisma.$transaction(async (tx) => {
    // Create buyer
    const newBuyer = await tx.buyer.create({
      data: {
        ...validatedData,
        ownerId: req.user!.id
      },
      include: {
        owner: {
          select: { fullName: true, email: true }
        }
      }
    });
    
    // Create history entry
    await tx.buyerHistory.create({
      data: {
        buyerId: newBuyer.id,
        changedBy: req.user!.id,
        diff: {
          action: 'created',
          changes: validatedData
        }
      }
    });
    
    return newBuyer;
  });
  
  const response: ApiResponse<typeof buyer> = {
    success: true,
    data: buyer,
    message: 'Buyer created successfully'
  };
  
  res.status(201).json(response);
}));

// PUT /buyers/:id - Update buyer
router.put('/:id', createUpdateLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = BuyerUpdateSchema.parse(req.body);
  const { updatedAt: clientUpdatedAt } = req.body;
  
  const buyer = await prisma.$transaction(async (tx) => {
    // Check if buyer exists and user has permission
    const existingBuyer = await tx.buyer.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingBuyer) {
      throw createError('Buyer not found', 404);
    }
    
    // Check ownership (only owner or admin can edit)
    if (existingBuyer.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw createError('Permission denied', 403);
    }
    
    // Check for concurrent modifications
    if (clientUpdatedAt && new Date(clientUpdatedAt) < existingBuyer.updatedAt) {
      throw createError('Record has been modified by another user. Please refresh and try again.', 409);
    }
    
    // Calculate changes for history
    const changes: any = {};
    Object.keys(validatedData).forEach(key => {
      const oldValue = (existingBuyer as any)[key];
      const newValue = (validatedData as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { from: oldValue, to: newValue };
      }
    });
    
    // Update buyer
    const updatedBuyer = await tx.buyer.update({
      where: { id: req.params.id },
      data: validatedData,
      include: {
        owner: {
          select: { fullName: true, email: true }
        }
      }
    });
    
    // Create history entry if there are changes
    if (Object.keys(changes).length > 0) {
      await tx.buyerHistory.create({
        data: {
          buyerId: updatedBuyer.id,
          changedBy: req.user!.id,
          diff: {
            action: 'updated',
            changes
          }
        }
      });
    }
    
    return updatedBuyer;
  });
  
  const response: ApiResponse<typeof buyer> = {
    success: true,
    data: buyer,
    message: 'Buyer updated successfully'
  };
  
  res.json(response);
}));

// DELETE /buyers/:id - Delete buyer
router.delete('/:id', createUpdateLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const buyer = await prisma.buyer.findUnique({
    where: { id: req.params.id }
  });
  
  if (!buyer) {
    throw createError('Buyer not found', 404);
  }
  
  // Check ownership (only owner or admin can delete)
  if (buyer.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw createError('Permission denied', 403);
  }
  
  await prisma.buyer.delete({
    where: { id: req.params.id }
  });
  
  const response: ApiResponse = {
    success: true,
    message: 'Buyer deleted successfully'
  };
  
  res.json(response);
}));

// POST /buyers/import - Import buyers from CSV
router.post('/import', importLimiter, upload.single('file'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    throw createError('CSV file is required', 400);
  }
  
  try {
    const fileBuffer = await fs.readFile(req.file.path);
    const csvData = await parseCSV(fileBuffer);
    
    if (csvData.length > 200) {
      throw createError('CSV file cannot contain more than 200 rows', 400);
    }
    
    const result: CSVImportResult = {
      successCount: 0,
      errorCount: 0,
      errors: []
    };
    
    const validBuyers = [];
    
    // Validate all rows first
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const validation = validateCSVRow(row, i + 1);
      
      if (validation.isValid && validation.data) {
        validBuyers.push({
          ...validation.data,
          ownerId: req.user!.id
        });
      } else {
        result.errorCount++;
        validation.errors.forEach(error => {
          result.errors.push({
            row: i + 1,
            field: error.field,
            message: error.message,
            data: row
          });
        });
      }
    }
    
    // Insert valid buyers in a transaction
    if (validBuyers.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const buyerData of validBuyers) {
          const buyer = await tx.buyer.create({
            data: buyerData
          });
          
          // Create history entry
          await tx.buyerHistory.create({
            data: {
              buyerId: buyer.id,
              changedBy: req.user!.id,
              diff: {
                action: 'imported',
                changes: buyerData
              }
            }
          });
          
          result.successCount++;
        }
      });
    }
    
    const response: ApiResponse<CSVImportResult> = {
      success: true,
      data: result,
      message: `Import completed. ${result.successCount} buyers imported, ${result.errorCount} errors.`
    };
    
    res.json(response);
    
  } finally {
    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (error) {
      console.error('Error deleting uploaded file:', error);
    }
  }
}));

// GET /buyers/export - Export buyers to CSV
router.get('/export', apiLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const filters = BuyerFiltersSchema.parse(req.query);
  
  const where: any = {};
  
  // Apply same filters as list endpoint
  if (filters.city) where.city = filters.city;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.status) where.status = filters.status;
  if (filters.timeline) where.timeline = filters.timeline;
  
  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ];
  }
  
  const buyers = await prisma.buyer.findMany({
    where,
    orderBy: {
      [filters.sortBy]: filters.sortOrder
    }
  });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `buyers-export-${timestamp}.csv`;
  const filepath = path.join('uploads', filename);
  
  await generateCSV(buyers, filepath);
  
  res.download(filepath, filename, async (err) => {
    if (!err) {
      // Clean up file after download
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error('Error deleting export file:', error);
      }
    }
  });
}));

export default router;
