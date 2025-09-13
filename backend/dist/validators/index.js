"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBHKRequirement = exports.validateBudget = exports.CSVRowSchema = exports.BuyerFiltersSchema = exports.BuyerUpdateSchema = exports.BuyerCreateSchema = exports.StatusSchema = exports.SourceSchema = exports.TimelineSchema = exports.PurposeSchema = exports.BHKSchema = exports.PropertyTypeSchema = exports.CitySchema = void 0;
const zod_1 = require("zod");
// Enum schemas
exports.CitySchema = zod_1.z.enum(['CHANDIGARH', 'MOHALI', 'ZIRAKPUR', 'PANCHKULA', 'OTHER']);
exports.PropertyTypeSchema = zod_1.z.enum(['APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'RETAIL']);
exports.BHKSchema = zod_1.z.enum(['STUDIO', 'ONE', 'TWO', 'THREE', 'FOUR']);
exports.PurposeSchema = zod_1.z.enum(['BUY', 'RENT']);
exports.TimelineSchema = zod_1.z.enum(['ZERO_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'EXPLORING']);
exports.SourceSchema = zod_1.z.enum(['WEBSITE', 'REFERRAL', 'WALK_IN', 'CALL', 'OTHER']);
exports.StatusSchema = zod_1.z.enum(['NEW', 'QUALIFIED', 'CONTACTED', 'VISITED', 'NEGOTIATION', 'CONVERTED', 'DROPPED']);
// Buyer validation schemas
exports.BuyerCreateSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be less than 80 characters'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
    city: exports.CitySchema,
    propertyType: exports.PropertyTypeSchema,
    bhk: exports.BHKSchema.optional(),
    purpose: exports.PurposeSchema,
    budgetMin: zod_1.z.number().int().positive().optional(),
    budgetMax: zod_1.z.number().int().positive().optional(),
    timeline: exports.TimelineSchema,
    source: exports.SourceSchema,
    notes: zod_1.z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([])
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
// Create a partial schema without the refinements first
const BuyerCreateSchemaBase = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be less than 80 characters'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    phone: zod_1.z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
    city: exports.CitySchema,
    propertyType: exports.PropertyTypeSchema,
    bhk: exports.BHKSchema.optional(),
    purpose: exports.PurposeSchema,
    budgetMin: zod_1.z.number().int().positive().optional(),
    budgetMax: zod_1.z.number().int().positive().optional(),
    timeline: exports.TimelineSchema,
    source: exports.SourceSchema,
    notes: zod_1.z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([])
});
exports.BuyerUpdateSchema = BuyerCreateSchemaBase.partial().extend({
    status: exports.StatusSchema.optional()
}).refine((data) => {
    // BHK is required for Apartment and Villa
    if (data.propertyType && ['APARTMENT', 'VILLA'].includes(data.propertyType) && !data.bhk) {
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
exports.BuyerFiltersSchema = zod_1.z.object({
    city: exports.CitySchema.optional(),
    propertyType: exports.PropertyTypeSchema.optional(),
    status: exports.StatusSchema.optional(),
    timeline: exports.TimelineSchema.optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(50).default(10),
    sortBy: zod_1.z.string().default('updatedAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// CSV Import validation
exports.CSVRowSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(80),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().regex(/^\d{10,15}$/),
    city: zod_1.z.string(),
    propertyType: zod_1.z.string(),
    bhk: zod_1.z.string().optional().or(zod_1.z.literal('')),
    purpose: zod_1.z.string(),
    budgetMin: zod_1.z.string().optional().or(zod_1.z.literal('')),
    budgetMax: zod_1.z.string().optional().or(zod_1.z.literal('')),
    timeline: zod_1.z.string(),
    source: zod_1.z.string(),
    notes: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
    tags: zod_1.z.string().optional().or(zod_1.z.literal('')),
    status: zod_1.z.string().optional().or(zod_1.z.literal(''))
});
// Helper function to validate budget values
const validateBudget = (min, max) => {
    if (min && max && max < min) {
        return false;
    }
    return true;
};
exports.validateBudget = validateBudget;
// Helper function to validate BHK requirement
const validateBHKRequirement = (propertyType, bhk) => {
    if (['APARTMENT', 'VILLA'].includes(propertyType) && !bhk) {
        return false;
    }
    return true;
};
exports.validateBHKRequirement = validateBHKRequirement;
//# sourceMappingURL=index.js.map