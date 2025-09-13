"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const auth_1 = require("../utils/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const errorHandler_1 = require("../middleware/errorHandler");
const validators_1 = require("../validators");
const csv_1 = require("../utils/csv");
const db_1 = __importDefault(require("../utils/db"));
const router = (0, express_1.Router)();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});
// Apply authentication to all routes
router.use(auth_1.demoAuthenticate);
// GET /buyers - List buyers with pagination and filters
router.get('/', rateLimiter_1.apiLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const filters = validators_1.BuyerFiltersSchema.parse(req.query);
    const where = {};
    // Apply filters
    if (filters.city)
        where.city = filters.city;
    if (filters.propertyType)
        where.propertyType = filters.propertyType;
    if (filters.status)
        where.status = filters.status;
    if (filters.timeline)
        where.timeline = filters.timeline;
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
    const total = await db_1.default.buyer.count({ where });
    // Get buyers
    const buyers = await db_1.default.buyer.findMany({
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
    const response = {
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
router.get('/:id', rateLimiter_1.apiLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const buyer = await db_1.default.buyer.findUnique({
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
        throw (0, errorHandler_1.createError)('Buyer not found', 404);
    }
    const response = {
        success: true,
        data: buyer
    };
    res.json(response);
}));
// POST /buyers - Create new buyer
router.post('/', rateLimiter_1.createUpdateLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = validators_1.BuyerCreateSchema.parse(req.body);
    const buyer = await db_1.default.$transaction(async (tx) => {
        // Create buyer
        const newBuyer = await tx.buyer.create({
            data: {
                ...validatedData,
                ownerId: req.user.id
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
                changedBy: req.user.id,
                diff: {
                    action: 'created',
                    changes: validatedData
                }
            }
        });
        return newBuyer;
    });
    const response = {
        success: true,
        data: buyer,
        message: 'Buyer created successfully'
    };
    res.status(201).json(response);
}));
// PUT /buyers/:id - Update buyer
router.put('/:id', rateLimiter_1.createUpdateLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = validators_1.BuyerUpdateSchema.parse(req.body);
    const { updatedAt: clientUpdatedAt } = req.body;
    const buyer = await db_1.default.$transaction(async (tx) => {
        // Check if buyer exists and user has permission
        const existingBuyer = await tx.buyer.findUnique({
            where: { id: req.params.id }
        });
        if (!existingBuyer) {
            throw (0, errorHandler_1.createError)('Buyer not found', 404);
        }
        // Check ownership (only owner or admin can edit)
        if (existingBuyer.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
            throw (0, errorHandler_1.createError)('Permission denied', 403);
        }
        // Check for concurrent modifications
        if (clientUpdatedAt && new Date(clientUpdatedAt) < existingBuyer.updatedAt) {
            throw (0, errorHandler_1.createError)('Record has been modified by another user. Please refresh and try again.', 409);
        }
        // Calculate changes for history
        const changes = {};
        Object.keys(validatedData).forEach(key => {
            const oldValue = existingBuyer[key];
            const newValue = validatedData[key];
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
                    changedBy: req.user.id,
                    diff: {
                        action: 'updated',
                        changes
                    }
                }
            });
        }
        return updatedBuyer;
    });
    const response = {
        success: true,
        data: buyer,
        message: 'Buyer updated successfully'
    };
    res.json(response);
}));
// DELETE /buyers/:id - Delete buyer
router.delete('/:id', rateLimiter_1.createUpdateLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const buyer = await db_1.default.buyer.findUnique({
        where: { id: req.params.id }
    });
    if (!buyer) {
        throw (0, errorHandler_1.createError)('Buyer not found', 404);
    }
    // Check ownership (only owner or admin can delete)
    if (buyer.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        throw (0, errorHandler_1.createError)('Permission denied', 403);
    }
    await db_1.default.buyer.delete({
        where: { id: req.params.id }
    });
    const response = {
        success: true,
        message: 'Buyer deleted successfully'
    };
    res.json(response);
}));
// POST /buyers/import - Import buyers from CSV
router.post('/import', rateLimiter_1.importLimiter, upload.single('file'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw (0, errorHandler_1.createError)('CSV file is required', 400);
    }
    try {
        const fileBuffer = await promises_1.default.readFile(req.file.path);
        const csvData = await (0, csv_1.parseCSV)(fileBuffer);
        if (csvData.length > 200) {
            throw (0, errorHandler_1.createError)('CSV file cannot contain more than 200 rows', 400);
        }
        const result = {
            successCount: 0,
            errorCount: 0,
            errors: []
        };
        const validBuyers = [];
        // Validate all rows first
        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            const validation = (0, csv_1.validateCSVRow)(row, i + 1);
            if (validation.isValid && validation.data) {
                validBuyers.push({
                    ...validation.data,
                    ownerId: req.user.id
                });
            }
            else {
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
            await db_1.default.$transaction(async (tx) => {
                for (const buyerData of validBuyers) {
                    const buyer = await tx.buyer.create({
                        data: buyerData
                    });
                    // Create history entry
                    await tx.buyerHistory.create({
                        data: {
                            buyerId: buyer.id,
                            changedBy: req.user.id,
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
        const response = {
            success: true,
            data: result,
            message: `Import completed. ${result.successCount} buyers imported, ${result.errorCount} errors.`
        };
        res.json(response);
    }
    finally {
        // Clean up uploaded file
        try {
            await promises_1.default.unlink(req.file.path);
        }
        catch (error) {
            console.error('Error deleting uploaded file:', error);
        }
    }
}));
// GET /buyers/export - Export buyers to CSV
router.get('/export', rateLimiter_1.apiLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const filters = validators_1.BuyerFiltersSchema.parse(req.query);
    const where = {};
    // Apply same filters as list endpoint
    if (filters.city)
        where.city = filters.city;
    if (filters.propertyType)
        where.propertyType = filters.propertyType;
    if (filters.status)
        where.status = filters.status;
    if (filters.timeline)
        where.timeline = filters.timeline;
    if (filters.search) {
        where.OR = [
            { fullName: { contains: filters.search, mode: 'insensitive' } },
            { phone: { contains: filters.search } },
            { email: { contains: filters.search, mode: 'insensitive' } }
        ];
    }
    const buyers = await db_1.default.buyer.findMany({
        where,
        orderBy: {
            [filters.sortBy]: filters.sortOrder
        }
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `buyers-export-${timestamp}.csv`;
    const filepath = path_1.default.join('uploads', filename);
    await (0, csv_1.generateCSV)(buyers, filepath);
    res.download(filepath, filename, async (err) => {
        if (!err) {
            // Clean up file after download
            try {
                await promises_1.default.unlink(filepath);
            }
            catch (error) {
                console.error('Error deleting export file:', error);
            }
        }
    });
}));
exports.default = router;
//# sourceMappingURL=buyers.js.map