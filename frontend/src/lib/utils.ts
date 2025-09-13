import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount?: number) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Enum display mappings
export const CITY_DISPLAY: Record<string, string> = {
  CHANDIGARH: 'Chandigarh',
  MOHALI: 'Mohali',
  ZIRAKPUR: 'Zirakpur',
  PANCHKULA: 'Panchkula',
  OTHER: 'Other',
};

export const PROPERTY_TYPE_DISPLAY: Record<string, string> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  PLOT: 'Plot',
  OFFICE: 'Office',
  RETAIL: 'Retail',
};

export const BHK_DISPLAY: Record<string, string> = {
  STUDIO: 'Studio',
  ONE: '1 BHK',
  TWO: '2 BHK',
  THREE: '3 BHK',
  FOUR: '4 BHK',
};

export const PURPOSE_DISPLAY: Record<string, string> = {
  BUY: 'Buy',
  RENT: 'Rent',
};

export const TIMELINE_DISPLAY: Record<string, string> = {
  ZERO_TO_THREE_MONTHS: '0-3 months',
  THREE_TO_SIX_MONTHS: '3-6 months',
  MORE_THAN_SIX_MONTHS: '6+ months',
  EXPLORING: 'Exploring',
};

export const SOURCE_DISPLAY: Record<string, string> = {
  WEBSITE: 'Website',
  REFERRAL: 'Referral',
  WALK_IN: 'Walk-in',
  CALL: 'Call',
  OTHER: 'Other',
};

export const STATUS_DISPLAY: Record<string, string> = {
  NEW: 'New',
  QUALIFIED: 'Qualified',
  CONTACTED: 'Contacted',
  VISITED: 'Visited',
  NEGOTIATION: 'Negotiation',
  CONVERTED: 'Converted',
  DROPPED: 'Dropped',
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  VISITED: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  CONVERTED: 'bg-emerald-100 text-emerald-800',
  DROPPED: 'bg-red-100 text-red-800',
};

export const getDisplayValue = (value: string, mapping: Record<string, string>) => {
  return mapping[value] || value;
};

export const validatePhone = (phone: string) => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
