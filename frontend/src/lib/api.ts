import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
}

export interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: 'CHANDIGARH' | 'MOHALI' | 'ZIRAKPUR' | 'PANCHKULA' | 'OTHER';
  propertyType: 'APARTMENT' | 'VILLA' | 'PLOT' | 'OFFICE' | 'RETAIL';
  bhk?: 'STUDIO' | 'ONE' | 'TWO' | 'THREE' | 'FOUR';
  purpose: 'BUY' | 'RENT';
  budgetMin?: number;
  budgetMax?: number;
  timeline: 'ZERO_TO_THREE_MONTHS' | 'THREE_TO_SIX_MONTHS' | 'MORE_THAN_SIX_MONTHS' | 'EXPLORING';
  source: 'WEBSITE' | 'REFERRAL' | 'WALK_IN' | 'CALL' | 'OTHER';
  status: 'NEW' | 'QUALIFIED' | 'CONTACTED' | 'VISITED' | 'NEGOTIATION' | 'CONVERTED' | 'DROPPED';
  notes?: string;
  tags: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    fullName: string;
    email: string;
  };
}

export interface BuyerFilters {
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth API
export const authAPI = {
  demoLogin: async (email?: string): Promise<{ token: string; user: User }> => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/demo-login', { email });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Login failed');
    }
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Buyers API
export const buyersAPI = {
  getList: async (filters: BuyerFilters = {}): Promise<PaginatedResponse<Buyer>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Buyer>>>('/buyers', { params: filters });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch buyers');
    }
    return response.data.data;
  },

  getById: async (id: string): Promise<Buyer> => {
    const response = await api.get<ApiResponse<Buyer>>(`/buyers/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Buyer not found');
    }
    return response.data.data;
  },

  create: async (data: Omit<Buyer, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Buyer> => {
    const response = await api.post<ApiResponse<Buyer>>('/buyers', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create buyer');
    }
    return response.data.data;
  },

  update: async (id: string, data: Partial<Buyer>): Promise<Buyer> => {
    const response = await api.put<ApiResponse<Buyer>>(`/buyers/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update buyer');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/buyers/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete buyer');
    }
  },

  importCSV: async (file: File): Promise<{ successCount: number; errorCount: number; errors: unknown[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<{ successCount: number; errorCount: number; errors: unknown[] }>>('/buyers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to import CSV');
    }
    
    return response.data.data || { successCount: 0, errorCount: 0, errors: [] };
  },

  exportCSV: async (filters: BuyerFilters = {}): Promise<Blob> => {
    const response = await api.get('/buyers/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
