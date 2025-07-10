import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Edit, Delete, Visibility, NotificationsActive } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onNotify?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  showNotify?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  editTooltip?: string;
  deleteTooltip?: string;
  viewTooltip?: string;
  notifyTooltip?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onView,
  onNotify,
  showEdit = true,
  showDelete = true,
  showView = false,
  showNotify = false,
  canEdit = true,
  canDelete = true,
  editTooltip,
  deleteTooltip,
  viewTooltip,
  notifyTooltip
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {showView && onView && (
        <Tooltip title={viewTooltip || t('view') || 'عرض'}>
          <IconButton onClick={onView} color="info" size="small">
            <Visibility />
          </IconButton>
        </Tooltip>
      )}
      
      {showEdit && onEdit && canEdit && (
        <Tooltip title={editTooltip || t('edit') || 'تعديل'}>
          <IconButton onClick={onEdit} color="primary" size="small">
            <Edit />
          </IconButton>
        </Tooltip>
      )}
      
      {showDelete && onDelete && canDelete && (
        <Tooltip title={deleteTooltip || t('delete') || 'حذف'}>
          <IconButton onClick={onDelete} color="error" size="small">
            <Delete />
          </IconButton>
        </Tooltip>
      )}
      
      {showNotify && onNotify && (
        <Tooltip title={notifyTooltip || t('notify') || 'إشعار'}>
          <IconButton onClick={onNotify} color="warning" size="small">
            <NotificationsActive />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionButtons;
