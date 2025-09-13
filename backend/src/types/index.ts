export type City = 'CHANDIGARH' | 'MOHALI' | 'ZIRAKPUR' | 'PANCHKULA' | 'OTHER';
export type PropertyType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'OFFICE' | 'RETAIL';
export type BHK = 'STUDIO' | 'ONE' | 'TWO' | 'THREE' | 'FOUR';
export type Purpose = 'BUY' | 'RENT';
export type Timeline = 'ZERO_TO_THREE_MONTHS' | 'THREE_TO_SIX_MONTHS' | 'MORE_THAN_SIX_MONTHS' | 'EXPLORING';
export type Source = 'WEBSITE' | 'REFERRAL' | 'WALK_IN' | 'CALL' | 'OTHER';
export type Status = 'NEW' | 'QUALIFIED' | 'CONTACTED' | 'VISITED' | 'NEGOTIATION' | 'CONVERTED' | 'DROPPED';
export type UserRole = 'USER' | 'ADMIN';

export interface BuyerCreateInput {
  fullName: string;
  email?: string;
  phone: string;
  city: City;
  propertyType: PropertyType;
  bhk?: BHK;
  purpose: Purpose;
  budgetMin?: number;
  budgetMax?: number;
  timeline: Timeline;
  source: Source;
  notes?: string;
  tags?: string[];
}

export interface BuyerUpdateInput extends Partial<BuyerCreateInput> {
  status?: Status;
}

export interface BuyerFilters {
  city?: City;
  propertyType?: PropertyType;
  status?: Status;
  timeline?: Timeline;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CSVImportRow {
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  source: string;
  notes?: string;
  tags?: string;
  status?: string;
}

export interface CSVImportResult {
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data: CSVImportRow;
  }>;
}
