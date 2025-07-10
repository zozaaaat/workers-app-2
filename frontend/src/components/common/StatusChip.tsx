import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface StatusChipProps {
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'default';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  label?: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, type = 'default', color, label }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('نشط') || lowerStatus.includes('active') || lowerStatus.includes('مفعل')) {
      return 'success';
    }
    if (lowerStatus.includes('منتهي') || lowerStatus.includes('expired') || lowerStatus.includes('انتهى')) {
      return 'error';
    }
    if (lowerStatus.includes('قريب') || lowerStatus.includes('warning') || lowerStatus.includes('تحذير')) {
      return 'warning';
    }
    if (lowerStatus.includes('معطل') || lowerStatus.includes('disabled') || lowerStatus.includes('غير مفعل')) {
      return 'default';
    }
    
    return type;
  };

  const getStatusText = (status: string) => {
    // ترجمة الحالات الشائعة
    switch (status.toLowerCase()) {
      case 'active':
        return t('active') || 'نشط';
      case 'inactive':
        return t('inactive') || 'غير نشط';
      case 'expired':
        return t('expired') || 'منتهي';
      case 'pending':
        return t('pending') || 'في انتظار';
      case 'approved':
        return t('approved') || 'موافق عليه';
      case 'rejected':
        return t('rejected') || 'مرفوض';
      default:
        return status;
    }
  };

  return (
    <Chip
      label={label || getStatusText(status)}
      color={(color || getStatusColor(status)) as any}
      size="small"
      sx={{
        fontWeight: 'bold',
        fontSize: '0.75rem',
        minWidth: 70,
      }}
    />
  );
};

export default StatusChip;
