import React from 'react';
import { Box, Typography, Card, CardContent, Divider, Chip } from '@mui/material';

interface StatItem {
  label: string;
  value: number;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  headerContent?: React.ReactNode;
  stats?: StatItem[];
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions,
  headerContent,
  stats
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {icon && (
                <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  {icon}
                </Box>
              )}
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="subtitle1" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
          </Box>
          {stats && stats.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {stats.map((stat, index) => (
                  <Box key={index} sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Chip
                      label={`${stat.value}`}
                      color={stat.color}
                      size="medium"
                      sx={{ mb: 1, fontWeight: 'bold', fontSize: '1.1rem' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
          {headerContent && (
            <>
              <Divider sx={{ my: 2 }} />
              {headerContent}
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 3 }}>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PageLayout;
