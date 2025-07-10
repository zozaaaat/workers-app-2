import React from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Box, CircularProgress, Typography } from '@mui/material';

interface DataTableProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  checkboxSelection?: boolean;
  onRowSelectionModelChange?: (selectionModel: any) => void;
  height?: number;
  noRowsText?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  loading = false,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  onPaginationModelChange,
  checkboxSelection = false,
  onRowSelectionModelChange,
  height = 400,
  noRowsText = "لا توجد بيانات"
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pageSize,
              page: 0,
            },
          },
        }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection={checkboxSelection}
        onPaginationModelChange={onPaginationModelChange}
        onRowSelectionModelChange={onRowSelectionModelChange}
        disableRowSelectionOnClick
        localeText={{
          noRowsLabel: noRowsText,
          MuiTablePagination: {
            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} من ${count}`,
            labelRowsPerPage: 'عدد الصفوف:',
          },
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            borderBottom: '2px solid #e0e0e0',
          },
        }}
      />
    </Box>
  );
};

export default DataTable;
