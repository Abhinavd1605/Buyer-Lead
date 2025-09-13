"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSV = exports.validateCSVRow = exports.parseCSV = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const createCsvWriter = __importStar(require("csv-writer"));
const stream_1 = require("stream");
const validators_1 = require("../validators");
// Enum mappings for CSV import
const CITY_MAPPING = {
    'chandigarh': 'CHANDIGARH',
    'mohali': 'MOHALI',
    'zirakpur': 'ZIRAKPUR',
    'panchkula': 'PANCHKULA',
    'other': 'OTHER'
};
const PROPERTY_TYPE_MAPPING = {
    'apartment': 'APARTMENT',
    'villa': 'VILLA',
    'plot': 'PLOT',
    'office': 'OFFICE',
    'retail': 'RETAIL'
};
const BHK_MAPPING = {
    'studio': 'STUDIO',
    '1': 'ONE',
    '2': 'TWO',
    '3': 'THREE',
    '4': 'FOUR'
};
const PURPOSE_MAPPING = {
    'buy': 'BUY',
    'rent': 'RENT'
};
const TIMELINE_MAPPING = {
    '0-3m': 'ZERO_TO_THREE_MONTHS',
    '3-6m': 'THREE_TO_SIX_MONTHS',
    '>6m': 'MORE_THAN_SIX_MONTHS',
    'exploring': 'EXPLORING'
};
const SOURCE_MAPPING = {
    'website': 'WEBSITE',
    'referral': 'REFERRAL',
    'walk-in': 'WALK_IN',
    'call': 'CALL',
    'other': 'OTHER'
};
const STATUS_MAPPING = {
    'new': 'NEW',
    'qualified': 'QUALIFIED',
    'contacted': 'CONTACTED',
    'visited': 'VISITED',
    'negotiation': 'NEGOTIATION',
    'converted': 'CONVERTED',
    'dropped': 'DROPPED'
};
const parseCSV = (csvBuffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = stream_1.Readable.from(csvBuffer.toString());
        stream
            .pipe((0, csv_parser_1.default)({
            headers: [
                'fullName', 'email', 'phone', 'city', 'propertyType',
                'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline',
                'source', 'notes', 'tags', 'status'
            ]
        }))
            .on('data', (data) => {
            results.push(data);
        })
            .on('end', () => {
            resolve(results);
        })
            .on('error', (error) => {
            reject(error);
        });
    });
};
exports.parseCSV = parseCSV;
const validateCSVRow = (row, rowIndex) => {
    const errors = [];
    // Validate and transform the row
    const transformedData = {};
    // Full name validation
    if (!row.fullName || row.fullName.trim().length < 2) {
        errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
    }
    else if (row.fullName.length > 80) {
        errors.push({ field: 'fullName', message: 'Full name must be less than 80 characters' });
    }
    else {
        transformedData.fullName = row.fullName.trim();
    }
    // Email validation (optional)
    if (row.email && row.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email.trim())) {
            errors.push({ field: 'email', message: 'Invalid email format' });
        }
        else {
            transformedData.email = row.email.trim();
        }
    }
    // Phone validation
    if (!row.phone || !/^\d{10,15}$/.test(row.phone.replace(/\D/g, ''))) {
        errors.push({ field: 'phone', message: 'Phone must be 10-15 digits' });
    }
    else {
        transformedData.phone = row.phone.replace(/\D/g, '');
    }
    // City validation
    const cityKey = row.city?.toLowerCase().trim();
    if (!cityKey || !CITY_MAPPING[cityKey]) {
        errors.push({ field: 'city', message: 'Invalid city. Must be one of: Chandigarh, Mohali, Zirakpur, Panchkula, Other' });
    }
    else {
        transformedData.city = CITY_MAPPING[cityKey];
    }
    // Property type validation
    const propertyTypeKey = row.propertyType?.toLowerCase().trim();
    if (!propertyTypeKey || !PROPERTY_TYPE_MAPPING[propertyTypeKey]) {
        errors.push({ field: 'propertyType', message: 'Invalid property type. Must be one of: Apartment, Villa, Plot, Office, Retail' });
    }
    else {
        transformedData.propertyType = PROPERTY_TYPE_MAPPING[propertyTypeKey];
    }
    // BHK validation (conditional)
    if (row.bhk && row.bhk.trim()) {
        const bhkKey = row.bhk.toLowerCase().trim();
        if (!BHK_MAPPING[bhkKey]) {
            errors.push({ field: 'bhk', message: 'Invalid BHK. Must be one of: Studio, 1, 2, 3, 4' });
        }
        else {
            transformedData.bhk = BHK_MAPPING[bhkKey];
        }
    }
    // Check BHK requirement for Apartment/Villa
    if (transformedData.propertyType && ['APARTMENT', 'VILLA'].includes(transformedData.propertyType) && !transformedData.bhk) {
        errors.push({ field: 'bhk', message: 'BHK is required for Apartment and Villa property types' });
    }
    // Purpose validation
    const purposeKey = row.purpose?.toLowerCase().trim();
    if (!purposeKey || !PURPOSE_MAPPING[purposeKey]) {
        errors.push({ field: 'purpose', message: 'Invalid purpose. Must be one of: Buy, Rent' });
    }
    else {
        transformedData.purpose = PURPOSE_MAPPING[purposeKey];
    }
    // Budget validation
    if (row.budgetMin && row.budgetMin.trim()) {
        const budgetMin = parseInt(row.budgetMin.replace(/\D/g, ''));
        if (isNaN(budgetMin) || budgetMin <= 0) {
            errors.push({ field: 'budgetMin', message: 'Budget minimum must be a positive number' });
        }
        else {
            transformedData.budgetMin = budgetMin;
        }
    }
    if (row.budgetMax && row.budgetMax.trim()) {
        const budgetMax = parseInt(row.budgetMax.replace(/\D/g, ''));
        if (isNaN(budgetMax) || budgetMax <= 0) {
            errors.push({ field: 'budgetMax', message: 'Budget maximum must be a positive number' });
        }
        else {
            transformedData.budgetMax = budgetMax;
        }
    }
    // Budget range validation
    if (transformedData.budgetMin && transformedData.budgetMax) {
        if (!(0, validators_1.validateBudget)(transformedData.budgetMin, transformedData.budgetMax)) {
            errors.push({ field: 'budgetMax', message: 'Budget maximum must be greater than or equal to budget minimum' });
        }
    }
    // Timeline validation
    const timelineKey = row.timeline?.toLowerCase().trim();
    if (!timelineKey || !TIMELINE_MAPPING[timelineKey]) {
        errors.push({ field: 'timeline', message: 'Invalid timeline. Must be one of: 0-3m, 3-6m, >6m, Exploring' });
    }
    else {
        transformedData.timeline = TIMELINE_MAPPING[timelineKey];
    }
    // Source validation
    const sourceKey = row.source?.toLowerCase().trim();
    if (!sourceKey || !SOURCE_MAPPING[sourceKey]) {
        errors.push({ field: 'source', message: 'Invalid source. Must be one of: Website, Referral, Walk-in, Call, Other' });
    }
    else {
        transformedData.source = SOURCE_MAPPING[sourceKey];
    }
    // Notes validation
    if (row.notes && row.notes.length > 1000) {
        errors.push({ field: 'notes', message: 'Notes must be less than 1000 characters' });
    }
    else if (row.notes && row.notes.trim()) {
        transformedData.notes = row.notes.trim();
    }
    // Tags validation
    if (row.tags && row.tags.trim()) {
        try {
            const tags = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            transformedData.tags = tags;
        }
        catch {
            transformedData.tags = [];
        }
    }
    else {
        transformedData.tags = [];
    }
    const isValid = errors.length === 0;
    return {
        isValid,
        errors,
        data: isValid ? transformedData : undefined
    };
};
exports.validateCSVRow = validateCSVRow;
const generateCSV = async (data, filename) => {
    const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: filename,
        header: [
            { id: 'fullName', title: 'fullName' },
            { id: 'email', title: 'email' },
            { id: 'phone', title: 'phone' },
            { id: 'city', title: 'city' },
            { id: 'propertyType', title: 'propertyType' },
            { id: 'bhk', title: 'bhk' },
            { id: 'purpose', title: 'purpose' },
            { id: 'budgetMin', title: 'budgetMin' },
            { id: 'budgetMax', title: 'budgetMax' },
            { id: 'timeline', title: 'timeline' },
            { id: 'source', title: 'source' },
            { id: 'notes', title: 'notes' },
            { id: 'tags', title: 'tags' },
            { id: 'status', title: 'status' },
            { id: 'updatedAt', title: 'updatedAt' }
        ]
    });
    // Transform data for CSV export
    const csvData = data.map(buyer => ({
        ...buyer,
        tags: buyer.tags ? buyer.tags.join(', ') : '',
        budgetMin: buyer.budgetMin || '',
        budgetMax: buyer.budgetMax || '',
        email: buyer.email || '',
        notes: buyer.notes || '',
        bhk: buyer.bhk || ''
    }));
    await csvWriter.writeRecords(csvData);
    return filename;
};
exports.generateCSV = generateCSV;
//# sourceMappingURL=csv.js.map