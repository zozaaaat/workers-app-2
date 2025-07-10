/**
 * Dashboard Page - Simplified Version
 * إصدار مبسط من لوحة التحكم
 */

import React from 'react';

const DashboardPageSimple: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', color: '#1976d2' }}>
        لوحة التحكم
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '8px' }}>العمال</h3>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>42</h2>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '8px' }}>الشركات</h3>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>8</h2>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ed6c02', marginBottom: '8px' }}>الإشعارات</h3>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>15</h2>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#2e7d32', marginBottom: '8px' }}>التراخيص النشطة</h3>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>23</h2>
        </div>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '16px' }}>حالة النظام</h3>
        <p style={{ color: '#2e7d32', margin: '8px 0' }}>
          ✅ جميع الخدمات تعمل بشكل طبيعي
        </p>
        <p style={{ color: '#1976d2', margin: '8px 0' }}>
          🔗 الباك إند: متصل
        </p>
        <p style={{ color: '#1976d2', margin: '8px 0' }}>
          📊 قاعدة البيانات: نشطة
        </p>
        <p style={{ color: '#0288d1', margin: '16px 0' }}>
          البيئة: {typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'development' : 'production'}
        </p>
      </div>
    </div>
  );
};

export default DashboardPageSimple;
