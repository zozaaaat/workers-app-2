import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick: (row: any) => void;
}

interface UniversalDataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  loading?: boolean;
  error?: string;
  searchPlaceholder?: string;
  searchFields?: string[];
  actions?: Action[];
  onAdd?: () => void;
  onExport?: () => void;
  showPagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  emptyMessage?: string;
  filterComponent?: React.ReactNode;
}

const UniversalDataTable: React.FC<UniversalDataTableProps> = ({
  title,
  data,
  columns,
  loading = false,
  error,
  searchPlaceholder = "البحث...",
  searchFields = [],
  actions = [],
  onAdd,
  onExport,
  showPagination = true,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  emptyMessage = "لا توجد بيانات للعرض",
  filterComponent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // فلترة البيانات حسب البحث
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // إذا تم تحديد حقول البحث، ابحث فيها فقط
    if (searchFields.length > 0) {
      return searchFields.some(field => {
        const value = row[field];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
    }
    
    // وإلا ابحث في جميع الحقول
    return Object.values(row).some(value => 
      value && value.toString().toLowerCase().includes(searchLower)
    );
  });

  // تحديد البيانات المعروضة حسب الصفحة
  const paginatedData = showPagination 
    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredData;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* الرأس */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            {title}
          </Typography>
          
          <Box display="flex" gap={2}>
            {onExport && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={onExport}
              >
                تصدير
              </Button>
            )}
            {onAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAdd}
              >
                إضافة جديد
              </Button>
            )}
          </Box>
        </Box>

        {/* شريط البحث والفلاتر */}
        <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          {filterComponent}
          
          <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
            إجمالي: {filteredData.length} عنصر
          </Typography>
        </Box>

        {/* الجدول */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ minWidth: column.width }}
                    sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                    الإجراءات
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                    <Box py={4}>
                      <Typography variant="h6" color="textSecondary">
                        {emptyMessage}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={row.id || index} hover>
                    {columns.map((column) => {
                      const value = row[column.id];
                      const displayValue = column.format ? column.format(value) : value;
                      
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.render ? (
                            column.render(value, row)
                          ) : (
                            <span>{displayValue || '-'}</span>
                          )}
                        </TableCell>
                      );
                    })}
                    
                    {actions.length > 0 && (
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          {actions.map((action) => (
                            <IconButton
                              key={action.id}
                              size="small"
                              color={action.color || 'primary'}
                              onClick={() => action.onClick(row)}
                              title={action.label}
                            >
                              {action.icon}
                            </IconButton>
                          ))}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* الترقيم */}
        {showPagination && filteredData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="صفوف لكل صفحة:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} من ${count}`
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalDataTable;

// مثال على الاستخدام:
/*
const WorkersTable = () => {
  const columns: Column[] = [
    { id: 'name', label: 'الاسم', width: 200 },
    { id: 'civil_id', label: 'الرقم المدني', width: 150 },
    { 
      id: 'salary', 
      label: 'الراتب', 
      align: 'right',
      format: (value) => `${value} د.ك`
    },
    {
      id: 'status',
      label: 'الحالة',
      render: (value) => (
        <Chip 
          label={value} 
          color={value === 'نشط' ? 'success' : 'default'} 
          size="small" 
        />
      )
    }
  ];

  const actions: Action[] = [
    {
      id: 'view',
      label: 'عرض',
      icon: <ViewIcon />,
      onClick: (row) => navigate(`/workers/${row.id}`)
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: <EditIcon />,
      onClick: (row) => handleEdit(row)
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (row) => handleDelete(row)
    }
  ];

  return (
    <UniversalDataTable
      title="قائمة العمال"
      data={workers}
      columns={columns}
      actions={actions}
      searchFields={['name', 'civil_id']}
      onAdd={() => setAddDialogOpen(true)}
      onExport={exportToExcel}
    />
  );
};
*/
