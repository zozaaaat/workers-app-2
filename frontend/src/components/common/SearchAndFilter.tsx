import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Chip } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchAndFilterProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filterType: string, value: string) => void;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  filterOptions?: FilterOption[];
  filterLabel?: string;
  searchPlaceholder?: string;
  onClear?: () => void;
  activeFiltersCount?: number;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue = '',
  onSearchChange,
  onSearch,
  onFilter,
  filters = [],
  filterOptions = [],
  filterLabel = 'تصفية',
  searchPlaceholder = 'البحث...',
  onClear,
  activeFiltersCount = 0
}) => {
  const { t } = useTranslation();
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue);
  const [localFilterValue, setLocalFilterValue] = React.useState('');

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (value: string) => {
    setLocalFilterValue(value);
    if (onFilter) {
      onFilter('role', value);
    }
  };

  const handleClear = () => {
    setLocalSearchValue('');
    setLocalFilterValue('');
    if (onSearchChange) {
      onSearchChange('');
    }
    if (onSearch) {
      onSearch('');
    }
    if (onFilter) {
      onFilter('', '');
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
      <TextField
        placeholder={searchPlaceholder}
        value={localSearchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        size="small"
        sx={{ minWidth: 200 }}
        InputProps={{
          startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
        }}
      />
      
      {filterOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{filterLabel}</InputLabel>
          <Select
            value={localFilterValue}
            label={filterLabel}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      {filters.map((filter, index) => (
        <FormControl key={index} size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{filter.label}</InputLabel>
          <Select
            value={filter.value}
            label={filter.label}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            <MenuItem value="">
              <em>{t('all') || 'الكل'}</em>
            </MenuItem>
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
      
      {(localSearchValue || localFilterValue || activeFiltersCount > 0) && (
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClear}
          size="small"
          color="inherit"
        >
          {t('clear') || 'مسح'}
        </Button>
      )}
      
      {activeFiltersCount > 0 && (
        <Chip
          label={`${activeFiltersCount} ${t('filtersActive') || 'مرشحات نشطة'}`}
          size="small"
          color="primary"
        />
      )}
    </Box>
  );
};

export default SearchAndFilter;
