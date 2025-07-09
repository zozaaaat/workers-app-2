/**
 * Custom React Hooks
 * 
 * Reusable hooks for common functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import type { Worker, Company, DashboardStats } from '../types';

// Hook for API calls with loading and error states
export const useApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Hook for workers data
export const useWorkers = () => {
  const {
    data: workers,
    loading,
    error,
    refetch
  } = useApi<Worker[]>(() => api.workers.getAll(), []);

  const activeWorkers = useMemo(() => 
    workers?.filter(worker => worker.status === 'نشط') || [], [workers]
  );

  const expiringSoon = useMemo(() => 
    workers?.filter(worker => {
      if (!worker.work_permit_end) return false;
      const expiryDate = new Date(worker.work_permit_end);
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      return expiryDate <= oneMonthFromNow && expiryDate >= new Date();
    }) || [], [workers]
  );

  const workersByType = useMemo(() => {
    if (!workers) return {};
    return workers.reduce((acc, worker) => {
      const type = worker.worker_type || 'غير محدد';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [workers]);

  return {
    workers: workers || [],
    activeWorkers,
    expiringSoon,
    workersByType,
    loading,
    error,
    refetch
  };
};

// Hook for companies data
export const useCompanies = () => {
  const {
    data: companies,
    loading,
    error,
    refetch
  } = useApi<Company[]>(() => api.companies.getAll(), []);

  const activeCompanies = useMemo(() => 
    companies?.filter(company => company.status === 'نشط') || [], [companies]
  );

  const companiesWithWorkerCount = useMemo(() => 
    companies?.map(company => ({
      ...company,
      workers_count: company.workers?.length || 0
    })) || [], [companies]
  );

  return {
    companies: companies || [],
    activeCompanies,
    companiesWithWorkerCount,
    loading,
    error,
    refetch
  };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  return useApi<DashboardStats>(() => api.analytics.getDashboardStats());
};

// Hook for form handling
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => void | Promise<void>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    setFieldError,
    handleSubmit,
    reset
  };
};

// Hook for local storage
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue] as const;
};

// Hook for debounced values
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for pagination
export const usePagination = <T>(
  items: T[],
  itemsPerPage: number = 20
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPrevious = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLast = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1
  };
};

// Hook for sorting
export const useSort = <T>(
  items: T[],
  defaultSortKey?: keyof T,
  defaultSortOrder: 'asc' | 'desc' = 'asc'
) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSortKey || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const result = aVal < bVal ? -1 : 1;
      return sortOrder === 'asc' ? result : -result;
    });
  }, [items, sortKey, sortOrder]);

  const handleSort = useCallback((key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey]);

  return {
    sortedItems,
    sortKey,
    sortOrder,
    handleSort
  };
};

// Hook for filtering
export const useFilter = <T>(
  items: T[],
  filterFunction: (item: T, query: string) => boolean
) => {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter(item => filterFunction(item, query.toLowerCase()));
  }, [items, query, filterFunction]);

  return {
    filteredItems,
    query,
    setQuery
  };
};

// All hooks are already exported above, no need for re-export
