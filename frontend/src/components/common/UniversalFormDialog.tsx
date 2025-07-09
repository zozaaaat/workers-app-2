import React from 'react';
import type { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface UniversalFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableSubmit?: boolean;
}

const UniversalFormDialog: React.FC<UniversalFormDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel = "حفظ",
  cancelLabel = "إلغاء",
  loading = false,
  maxWidth = 'sm',
  fullWidth = true,
  disableSubmit = false
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2" fontWeight="bold">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {children}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        
        {onSubmit && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || disableSubmit}
          >
            {loading ? "جاري الحفظ..." : submitLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UniversalFormDialog;
