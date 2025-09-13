import { z } from 'zod';

// Enum schemas
export const CitySchema = z.enum(['CHANDIGARH', 'MOHALI', 'ZIRAKPUR', 'PANCHKULA', 'OTHER']);
export const PropertyTypeSchema = z.enum(['APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'RETAIL']);
export const BHKSchema = z.enum(['STUDIO', 'ONE', 'TWO', 'THREE', 'FOUR']);
export const PurposeSchema = z.enum(['BUY', 'RENT']);
export const TimelineSchema = z.enum(['ZERO_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'EXPLORING']);
export const SourceSchema = z.enum(['WEBSITE', 'REFERRAL', 'WALK_IN', 'CALL', 'OTHER']);
export const StatusSchema = z.enum(['NEW', 'QUALIFIED', 'CONTACTED', 'VISITED', 'NEGOTIATION', 'CONVERTED', 'DROPPED']);

// Buyer validation schemas
export const BuyerCreateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be less than 80 characters'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: CitySchema,
  propertyType: PropertyTypeSchema,
  bhk: BHKSchema.optional(),
  purpose: PurposeSchema,
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: TimelineSchema,
  source: SourceSchema,
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  tags: z.array(z.string()).optional().default([])
}).refine((data) => {
  // BHK is required for Apartment and Villa
  if (['APARTMENT', 'VILLA'].includes(data.propertyType) && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
}).refine((data) => {
  // Budget validation: budgetMax >= budgetMin when both present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: 'Budget maximum must be greater than or equal to budget minimum',
  path: ['budgetMax']
});

export const BuyerUpdateSchema = BuyerCreateSchema.partial().extend({
  status: StatusSchema.optional()
});

export const BuyerFiltersSchema = z.object({
  city: CitySchema.optional(),
  propertyType: PropertyTypeSchema.optional(),
  status: StatusSchema.optional(),
  timeline: TimelineSchema.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
  sortBy: z.string().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// CSV Import validation
export const CSVRowSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.string(),
  propertyType: z.string(),
  bhk: z.string().optional().or(z.literal('')),
  purpose: z.string(),
  budgetMin: z.string().optional().or(z.literal('')),
  budgetMax: z.string().optional().or(z.literal('')),
  timeline: z.string(),
  source: z.string(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal(''))
});

// Helper function to validate budget values
export const validateBudget = (min?: number, max?: number): boolean => {
  if (min && max && max < min) {
    return false;
  }
  return true;
};

// Helper function to validate BHK requirement
export const validateBHKRequirement = (propertyType: string, bhk?: string): boolean => {
  if (['APARTMENT', 'VILLA'].includes(propertyType) && !bhk) {
    return false;
  }
  return true;
};
