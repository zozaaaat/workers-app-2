import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ExportService } from '../../services/ExportService';
import type { ExportColumn, ExportOptions } from '../../services/ExportService';

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename?: string;
  title?: string;
  variant?: 'button' | 'icon' | 'menu';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  showAdvancedOptions?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  filename,
  title = 'تصدير البيانات',
  variant = 'button',
  size = 'medium',
  disabled = false,
  showAdvancedOptions = true
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [advancedDialogOpen, setAdvancedDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions & {
    selectedColumns: string[];
    includeFilters: boolean;
  }>({
    format: 'excel',
    filename: filename || `export_${new Date().toISOString().split('T')[0]}`,
    title: title,
    includeDate: true,
    includeStats: true,
    selectedColumns: columns.map(col => col.key),
    includeFilters: false
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // تصدير سريع
  const handleQuickExport = (format: 'excel' | 'pdf') => {
    try {
      const options: ExportOptions = {
        format,
        filename: `${filename || 'export'}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
        title,
        includeDate: true,
        includeStats: true
      };

      if (format === 'excel') {
        ExportService.exportToExcel(data, columns, options);
      } else {
        ExportService.exportToPDF(data, columns, options);
      }

      handleClose();
    } catch (error) {
      console.error('خطأ في التصدير:', error);
    }
  };

  // تصدير متقدم
  const handleAdvancedExport = () => {
    try {
      const selectedCols = columns.filter(col => 
        exportOptions.selectedColumns.includes(col.key)
      );

      const options: ExportOptions = {
        format: exportOptions.format,
        filename: exportOptions.filename + (exportOptions.format === 'excel' ? '.xlsx' : '.pdf'),
        title: exportOptions.title,
        includeDate: exportOptions.includeDate,
        includeStats: exportOptions.includeStats
      };

      if (exportOptions.format === 'excel') {
        ExportService.exportToExcel(data, selectedCols, options);
      } else {
        ExportService.exportToPDF(data, selectedCols, options);
      }

      setAdvancedDialogOpen(false);
      handleClose();
    } catch (error) {
      console.error('خطأ في التصدير المتقدم:', error);
    }
  };

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <Button
            onClick={handleClick}
            disabled={disabled || data.length === 0}
            size={size}
            startIcon={<DownloadIcon />}
          >
            تصدير
          </Button>
        );
      
      case 'menu':
        return (
          <Button
            onClick={handleClick}
            disabled={disabled || data.length === 0}
            variant="outlined"
            size={size}
            startIcon={<DownloadIcon />}
          >
            تصدير ({data.length})
          </Button>
        );
      
      default:
        return (
          <Button
            onClick={handleClick}
            disabled={disabled || data.length === 0}
            variant="contained"
            size={size}
            startIcon={<DownloadIcon />}
          >
            تصدير البيانات
          </Button>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {/* قائمة التصدير */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleQuickExport('excel')}>
          <ExcelIcon sx={{ mr: 1, color: 'success.main' }} />
          تصدير Excel
        </MenuItem>
        
        <MenuItem onClick={() => handleQuickExport('pdf')}>
          <PdfIcon sx={{ mr: 1, color: 'error.main' }} />
          تصدير PDF
        </MenuItem>
        
        {showAdvancedOptions && (
          <>
            <Divider />
            <MenuItem onClick={() => setAdvancedDialogOpen(true)}>
              <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
              خيارات متقدمة
            </MenuItem>
          </>
        )}
      </Menu>

      {/* حوار الخيارات المتقدمة */}
      <Dialog 
        open={advancedDialogOpen} 
        onClose={() => setAdvancedDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            خيارات التصدير المتقدمة
          </Box>
          <Button 
            onClick={() => setAdvancedDialogOpen(false)}
            size="small"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* معلومات أساسية */}
            <Box>
              <Typography variant="h6" gutterBottom>
                الإعدادات الأساسية
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>تنسيق التصدير</InputLabel>
                  <Select
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions({
                      ...exportOptions, 
                      format: e.target.value as 'excel' | 'pdf'
                    })}
                    label="تنسيق التصدير"
                  >
                    <MenuItem value="excel">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ExcelIcon color="success" />
                        Excel (.xlsx)
                      </Box>
                    </MenuItem>
                    <MenuItem value="pdf">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PdfIcon color="error" />
                        PDF (.pdf)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="اسم الملف"
                  value={exportOptions.filename}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    filename: e.target.value
                  })}
                />
              </Box>

              <TextField
                fullWidth
                label="عنوان التقرير"
                value={exportOptions.title}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  title: e.target.value
                })}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeDate}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeDate: e.target.checked
                      })}
                    />
                  }
                  label="تضمين التاريخ"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeStats}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeStats: e.target.checked
                      })}
                    />
                  }
                  label="تضمين الإحصائيات"
                />
              </Box>
            </Box>

            <Divider />

            {/* اختيار الأعمدة */}
            <Box>
              <Typography variant="h6" gutterBottom>
                اختيار الأعمدة ({exportOptions.selectedColumns.length} من {columns.length})
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  onClick={() => setExportOptions({
                    ...exportOptions,
                    selectedColumns: columns.map(col => col.key)
                  })}
                >
                  تحديد الكل
                </Button>
                
                <Button
                  size="small"
                  onClick={() => setExportOptions({
                    ...exportOptions,
                    selectedColumns: []
                  })}
                >
                  إلغاء التحديد
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {columns.map(column => (
                  <Chip
                    key={column.key}
                    label={column.label}
                    onClick={() => {
                      const isSelected = exportOptions.selectedColumns.includes(column.key);
                      setExportOptions({
                        ...exportOptions,
                        selectedColumns: isSelected
                          ? exportOptions.selectedColumns.filter((key: string) => key !== column.key)
                          : [...exportOptions.selectedColumns, column.key]
                      });
                    }}
                    color={exportOptions.selectedColumns.includes(column.key) ? 'primary' : 'default'}
                    variant={exportOptions.selectedColumns.includes(column.key) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>

            {/* معاينة */}
            <Box>
              <Alert severity="info">
                <Typography variant="body2">
                  سيتم تصدير <strong>{data.length}</strong> سجل مع <strong>{exportOptions.selectedColumns.length}</strong> عمود
                  في تنسيق <strong>{exportOptions.format === 'excel' ? 'Excel' : 'PDF'}</strong>
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAdvancedDialogOpen(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleAdvancedExport}
            variant="contained"
            disabled={exportOptions.selectedColumns.length === 0}
            startIcon={exportOptions.format === 'excel' ? <ExcelIcon /> : <PdfIcon />}
          >
            تصدير {exportOptions.format === 'excel' ? 'Excel' : 'PDF'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportButton;
