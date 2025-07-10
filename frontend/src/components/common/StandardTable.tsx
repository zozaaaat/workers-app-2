import React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CustomColumn {
  id: string;
  label: string;
  render?: (item: any) => React.ReactNode;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

interface StandardTableProps {
  rows?: any[];
  data?: any[];
  columns: GridColDef[] | CustomColumn[];
  loading?: boolean;
  title?: string;
  height?: number;
  pageSize?: number;
  onRowClick?: (row: any) => void;
  noRowsText?: string;
  emptyMessage?: string;
}

const StandardTable: React.FC<StandardTableProps> = ({
  rows,
  data,
  columns,
  loading = false,
  title,
  height = 400,
  pageSize = 10,
  onRowClick,
  noRowsText,
  emptyMessage
}) => {
  const { t } = useTranslation();
  
  // Use either rows or data
  const tableData = rows || data || [];
  
  // Convert custom columns to DataGrid format
  const dataGridColumns: GridColDef[] = columns.map((col: any) => {
    if (col.render) {
      return {
        field: col.id,
        headerName: col.label,
        width: col.width || 150,
        align: col.align || 'left',
        headerAlign: col.align || 'left',
        renderCell: (params: any) => col.render(params.row),
        sortable: false,
      };
    } else if (col.field) {
      // Already a GridColDef
      return col;
    } else {
      // Simple column definition
      return {
        field: col.id,
        headerName: col.label,
        width: col.width || 150,
        align: col.align || 'left',
        headerAlign: col.align || 'left',
      };
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ height: height + 100, width: '100%' }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}
      <DataGrid
        rows={tableData.map((item, index) => ({ ...item, id: item.id || index }))}
        columns={dataGridColumns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        localeText={{
          noRowsLabel: emptyMessage || noRowsText || t('noData') || 'لا توجد بيانات',
          toolbarColumns: t('columns') || 'الأعمدة',
          toolbarFilters: t('filters') || 'المرشحات',
          toolbarDensity: t('density') || 'الكثافة',
          toolbarExport: t('export') || 'تصدير',
        }}
      />
    </Paper>
  );
};

export default StandardTable;
