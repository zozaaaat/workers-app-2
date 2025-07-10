import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  Divider,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Business as CompanyIcon,
  Description as LicenseIcon,
  EventBusy as AbsenceIcon,
  BeachAccess as LeaveIcon,
  Warning as ViolationIcon,
  RemoveCircle as DeductionIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useApi } from '../../services/ApiService';

interface SearchResult {
  id: number;
  type: 'worker' | 'company' | 'license' | 'absence' | 'leave' | 'violation' | 'deduction';
  title: string;
  subtitle?: string;
  description?: string;
  data: any;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  open,
  onClose,
  onResultClick
}) => {
  const api = useApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // تنظيف النتائج عند الإغلاق
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setResults([]);
      setError('');
    }
  }, [open]);

  // البحث المتأخر (debounced search)
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const searchResults = await performSearch(query);
        setResults(searchResults);
      } catch (err: any) {
        setError('حدث خطأ أثناء البحث');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // تنفيذ البحث عند تغيير النص
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // تنفيذ البحث الفعلي
  const performSearch = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    try {
      // البحث في العمال
      const workers = await api.workers.getAll();
      workers.forEach((worker: any) => {
        if (
          worker.name?.toLowerCase().includes(lowerQuery) ||
          worker.civil_id?.includes(query) ||
          worker.custom_id?.includes(query) ||
          worker.job_title?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: worker.id,
            type: 'worker',
            title: worker.name,
            subtitle: `${worker.civil_id} - ${worker.job_title}`,
            description: `الشركة: ${worker.company?.file_name || 'غير محدد'}`,
            data: worker
          });
        }
      });

      // البحث في الشركات
      const companies = await api.companies.getAll();
      companies.forEach((company: any) => {
        if (
          company.file_name?.toLowerCase().includes(lowerQuery) ||
          company.file_number?.includes(query) ||
          company.commercial_registration_number?.includes(query)
        ) {
          results.push({
            id: company.id,
            type: 'company',
            title: company.file_name,
            subtitle: `ملف رقم: ${company.file_number}`,
            description: `${company.total_workers} عامل - ${company.total_licenses} ترخيص`,
            data: company
          });
        }
      });

      // البحث في التراخيص
      const licenses = await api.licenses.getAll();
      licenses.forEach((license: any) => {
        if (
          license.name?.toLowerCase().includes(lowerQuery) ||
          license.license_number?.includes(query) ||
          license.civil_id?.includes(query)
        ) {
          results.push({
            id: license.id,
            type: 'license',
            title: license.name,
            subtitle: `ترخيص رقم: ${license.license_number}`,
            description: `${license.license_type} - ${license.issuing_authority}`,
            data: license
          });
        }
      });

      // يمكن إضافة البحث في الغيابات، الإجازات، المخالفات، والخصومات هنا
      // حالياً سنتركها فارغة لأن الـ API غير متوفر بعد

    } catch (error) {
      console.error('Error in search:', error);
    }

    return results.slice(0, 20); // حد أقصى 20 نتيجة
  };

  // أيقونة حسب نوع النتيجة
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'worker': return <PersonIcon color="primary" />;
      case 'company': return <CompanyIcon color="secondary" />;
      case 'license': return <LicenseIcon color="info" />;
      case 'absence': return <AbsenceIcon color="warning" />;
      case 'leave': return <LeaveIcon color="success" />;
      case 'violation': return <ViolationIcon color="error" />;
      case 'deduction': return <DeductionIcon color="error" />;
      default: return <SearchIcon />;
    }
  };

  // لون الـ chip حسب النوع
  const getTypeChipColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'worker': return 'primary';
      case 'company': return 'secondary';
      case 'license': return 'info';
      case 'absence': return 'warning';
      case 'leave': return 'success';
      case 'violation': return 'error';
      case 'deduction': return 'error';
      default: return 'default';
    }
  };

  // تسمية النوع
  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'worker': return 'عامل';
      case 'company': return 'شركة';
      case 'license': return 'ترخيص';
      case 'absence': return 'غياب';
      case 'leave': return 'إجازة';
      case 'violation': return 'مخالفة';
      case 'deduction': return 'خصم';
      default: return 'غير محدد';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon />
            البحث العالمي
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* صندوق البحث */}
        <TextField
          fullWidth
          placeholder="ابحث في العمال، الشركات، التراخيص..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
          autoFocus
        />

        {/* رسائل التوجيه */}
        {!searchQuery && (
          <Alert severity="info" sx={{ mb: 2 }}>
            اكتب على الأقل حرفين للبدء في البحث
          </Alert>
        )}

        {searchQuery && searchQuery.length < 2 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            يجب كتابة حرفين على الأقل للبحث
          </Alert>
        )}

        {/* رسالة خطأ */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* النتائج */}
        {searchQuery.length >= 2 && !loading && results.length === 0 && !error && (
          <Alert severity="info">
            لم يتم العثور على نتائج للبحث "{searchQuery}"
          </Alert>
        )}

        {results.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              {results.length} نتيجة للبحث "{searchQuery}"
            </Typography>
            
            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {results.map((result, index) => (
                <React.Fragment key={`${result.type}-${result.id}`}>
                  <ListItem
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                      mb: 0.5
                    }}
                    onClick={() => handleResultClick(result)}
                  >
                    <ListItemIcon>
                      {getResultIcon(result.type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {result.title}
                          </Typography>
                          <Chip 
                            label={getTypeLabel(result.type)}
                            size="small"
                            color={getTypeChipColor(result.type) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          {result.subtitle && (
                            <Typography variant="body2" color="text.secondary">
                              {result.subtitle}
                            </Typography>
                          )}
                          {result.description && (
                            <Typography variant="caption" color="text.secondary">
                              {result.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// مساعد debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default GlobalSearch;
