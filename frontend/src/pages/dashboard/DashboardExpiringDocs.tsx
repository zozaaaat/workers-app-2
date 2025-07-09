/**
 * Dashboard Expiring Documents Component
 * مكون الوثائق المنتهية الصلاحية
 */

import React, { memo } from 'react';
import { useExpiringDocuments } from '../../services/api-optimized';

interface ExpiringDocProps {
  worker_name: string;
  document_type: string;
  expires_at: string;
  days_remaining: number;
}

const ExpiringDocItem = memo<ExpiringDocProps>(({ worker_name, document_type, expires_at, days_remaining }) => {
  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'border-l-red-400 bg-red-50';
    if (days <= 14) return 'border-l-yellow-400 bg-yellow-50';
    return 'border-l-blue-400 bg-blue-50';
  };

  const getUrgencyText = (days: number) => {
    if (days <= 0) return 'منتهي الصلاحية';
    if (days === 1) return 'يوم واحد متبقي';
    if (days <= 7) return `${days} أيام متبقية`;
    if (days <= 14) return `أسبوعان متبقيان`;
    return `${days} يوم متبقي`;
  };

  return (
    <div className={`border-l-4 p-3 rounded-r-lg ${getUrgencyColor(days_remaining)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{worker_name}</h4>
          <p className="text-gray-700 text-sm mt-1">{document_type}</p>
          <p className="text-gray-500 text-xs mt-2">
            ينتهي في: {new Date(expires_at).toLocaleDateString('ar-EG')}
          </p>
        </div>
        <div className="text-left">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            days_remaining <= 7 ? 'bg-red-100 text-red-800' :
            days_remaining <= 14 ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {getUrgencyText(days_remaining)}
          </span>
        </div>
      </div>
    </div>
  );
});

const DashboardExpiringDocs: React.FC = memo(() => {
  const { data: expiringDocs, isLoading, error } = useExpiringDocuments(30);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الوثائق المنتهية الصلاحية</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 text-sm">خطأ في تحميل الوثائق المنتهية</p>
        </div>
      </div>
    );
  }

  const criticalDocs = expiringDocs?.filter((doc: ExpiringDocProps) => doc.days_remaining <= 7) || [];
  const warningDocs = expiringDocs?.filter((doc: ExpiringDocProps) => doc.days_remaining > 7 && doc.days_remaining <= 14) || [];
  const infoDocs = expiringDocs?.filter((doc: ExpiringDocProps) => doc.days_remaining > 14) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">الوثائق المنتهية الصلاحية</h3>
        <div className="flex items-center text-orange-600">
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <span className="text-sm">تحذيرات</span>
        </div>
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse border-l-4 border-gray-200 p-3 rounded-r-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : expiringDocs && expiringDocs.length > 0 ? (
        <div className="space-y-4">
          {/* Critical (Red) - <= 7 days */}
          {criticalDocs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                عاجل ({criticalDocs.length})
              </h4>
              <div className="space-y-2">
                {criticalDocs.map((doc: ExpiringDocProps, index: number) => (
                  <ExpiringDocItem key={`critical-${index}`} {...doc} />
                ))}
              </div>
            </div>
          )}

          {/* Warning (Yellow) - 8-14 days */}
          {warningDocs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                </svg>
                تحذير ({warningDocs.length})
              </h4>
              <div className="space-y-2">
                {warningDocs.map((doc: ExpiringDocProps, index: number) => (
                  <ExpiringDocItem key={`warning-${index}`} {...doc} />
                ))}
              </div>
            </div>
          )}

          {/* Info (Blue) - 15-30 days */}
          {infoDocs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                معلومات ({infoDocs.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {infoDocs.map((doc: ExpiringDocProps, index: number) => (
                  <ExpiringDocItem key={`info-${index}`} {...doc} />
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">إجمالي الوثائق:</span>
              <span className="font-medium text-gray-900">{expiringDocs.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-700">تحتاج إجراء فوري:</span>
              <span className="font-medium text-red-600">{criticalDocs.length}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-gray-500 text-sm">جميع الوثائق سارية المفعول</p>
          <p className="text-gray-400 text-xs mt-1">لا توجد وثائق تنتهي صلاحيتها خلال الشهر القادم</p>
        </div>
      )}

      {/* Action buttons */}
      {expiringDocs && expiringDocs.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
            تجديد الوثائق
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
            إرسال تذكيرات
          </button>
        </div>
      )}
    </div>
  );
});

DashboardExpiringDocs.displayName = 'DashboardExpiringDocs';

export default DashboardExpiringDocs;
