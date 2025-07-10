import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonLabel?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showAddButton = false,
  onAddClick,
  addButtonLabel = "إضافة",
  children
}) => {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {children}
        {showAddButton && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddClick}
            sx={{ borderRadius: 2 }}
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
