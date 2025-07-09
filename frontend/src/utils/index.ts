/**
 * Utility Functions
 * 
 * Common utility functions used across the application
 */

import { format, isValid, parseISO, addDays, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// Date utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date: string | Date, formatString: string = 'dd/MM/yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, formatString, { locale: ar });
    } catch {
      return '';
    }
  },

  // Format date with Arabic month names
  formatDateArabic: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, 'dd MMMM yyyy', { locale: ar });
    } catch {
      return '';
    }
  },

  // Check if date is expired
  isExpired: (date: string | Date): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      return dateObj < new Date();
    } catch {
      return false;
    }
  },

  // Check if date is expiring soon
  isExpiringSoon: (date: string | Date, daysThreshold: number = 30): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      const now = new Date();
      const threshold = addDays(now, daysThreshold);
      return dateObj <= threshold && dateObj >= now;
    } catch {
      return false;
    }
  },

  // Get days until expiration
  getDaysUntilExpiration: (date: string | Date): number => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 0;
      return differenceInDays(dateObj, new Date());
    } catch {
      return 0;
    }
  },

  // Get relative time in Arabic
  getRelativeTime: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      const now = new Date();
      const diff = differenceInDays(dateObj, now);
      
      if (diff === 0) return 'اليوم';
      if (diff === 1) return 'غداً';
      if (diff === -1) return 'أمس';
      if (diff > 1) return `خلال ${diff} يوم`;
      if (diff < -1) return `منذ ${Math.abs(diff)} يوم`;
      
      return '';
    } catch {
      return '';
    }
  }
};

// String utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Truncate string with ellipsis
  truncate: (str: string, length: number): string => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  // Remove extra spaces
  cleanSpaces: (str: string): string => {
    if (!str) return '';
    return str.replace(/\s+/g, ' ').trim();
  },

  // Generate initials from name
  getInitials: (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  // Format phone number
  formatPhone: (phone: string): string => {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    
    return phone;
  },

  // Validate email
  isValidEmail: (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// Number utilities
export const numberUtils = {
  // Format currency
  formatCurrency: (amount: number, currency: string = 'SAR'): string => {
    if (typeof amount !== 'number') return '';
    
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Format number with thousands separator
  formatNumber: (num: number): string => {
    if (typeof num !== 'number') return '';
    return new Intl.NumberFormat('ar-SA').format(num);
  },

  // Parse number from string
  parseNumber: (str: string): number => {
    if (!str) return 0;
    const cleaned = str.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  },

  // Calculate percentage
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
};

// Array utilities
export const arrayUtils = {
  // Remove duplicates
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  // Group array by key
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Sort array by key
  sortBy: <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Chunk array into smaller arrays
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};

// File utilities
export const fileUtils = {
  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file extension
  getFileExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  // Check if file is image
  isImage: (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const extension = fileUtils.getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
  },

  // Check if file is PDF
  isPDF: (filename: string): boolean => {
    return fileUtils.getFileExtension(filename).toLowerCase() === 'pdf';
  },

  // Download file from blob
  downloadFile: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

// Local storage utilities
export const storageUtils = {
  // Set item in localStorage
  setItem: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Get item from localStorage
  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue || null;
      return JSON.parse(item);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },

  // Remove item from localStorage
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Clear all localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// URL utilities
export const urlUtils = {
  // Build query string from object
  buildQueryString: (params: Record<string, any>): string => {
    const filtered = Object.entries(params).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (filtered.length === 0) return '';
    
    const queryString = filtered
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    return `?${queryString}`;
  },

  // Parse query string to object
  parseQueryString: (queryString: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(queryString);
    
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }
};

// Validation utilities
export const validationUtils = {
  // Check if value is empty
  isEmpty: (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  // Validate Saudi ID number
  isValidSaudiId: (id: string): boolean => {
    if (!id || id.length !== 10) return false;
    
    const digits = id.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      if (i % 2 === 0) {
        const doubled = digits[i] * 2;
        sum += doubled > 9 ? doubled - 9 : doubled;
      } else {
        sum += digits[i];
      }
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[9];
  },

  // Validate Saudi phone number
  isValidSaudiPhone: (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    
    // Should start with 05 and be 10 digits
    return /^05\d{8}$/.test(cleaned);
  }
};

// Color utilities
export const colorUtils = {
  // Get status color
  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      'نشط': '#10B981',
      'معطل': '#EF4444',
      'منتهي العقد': '#F59E0B',
      'في إجازة': '#3B82F6',
      'pending': '#F59E0B',
      'approved': '#10B981',
      'rejected': '#EF4444',
      'active': '#10B981',
      'inactive': '#EF4444',
      'expired': '#EF4444'
    };
    
    return colors[status] || '#6B7280';
  },

  // Generate random color
  generateRandomColor: (): string => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
};

// Export all utilities
export default {
  date: dateUtils,
  string: stringUtils,
  number: numberUtils,
  array: arrayUtils,
  file: fileUtils,
  storage: storageUtils,
  url: urlUtils,
  validation: validationUtils,
  color: colorUtils
};
