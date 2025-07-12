import React, { useState } from 'react'
import { useOverviewData } from '../../hooks/useOverviewData'
import {
  formatNumber,
  formatRelativeTime,
  translateDocumentType,
  translateEntityType,
  getAlertColor,
  getTaskPriorityColor,
  translateTaskPriority,
  translateTaskStatus,
  getTaskStatusColor,
} from '../../utils/formatters'

const Overview: React.FC = () => {
  const { 
    stats, 
    expiryAlerts, 
    recentFiles, 
    userTasks, 
    loading, 
    error, 
    markTaskAsCompleted,
    markTaskAsInProgress 
  } = useOverviewData()
  
  const [taskActionLoading, setTaskActionLoading] = useState<number | null>(null)

  // معالجة تغيير حالة المهمة
  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      setTaskActionLoading(taskId)
      
      if (newStatus === 'completed') {
        await markTaskAsCompleted(taskId)
      } else if (newStatus === 'in_progress') {
        await markTaskAsInProgress(taskId)
      }
      
    } catch (error) {
      console.error('Error updating task:', error)
      alert('حدث خطأ في تحديث المهمة')
    } finally {
      setTaskActionLoading(null)
    }
  }

  // فلترة المهام حسب الحالة
  const pendingTasks = userTasks.filter((task: any) => task.status === 'pending')
  const inProgressTasks = userTasks.filter((task: any) => task.status === 'in_progress')
  const completedTasks = userTasks.filter((task: any) => task.status === 'completed')

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">⚠️ خطأ في تحميل البيانات</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
        <p className="text-gray-600 mt-1">نظرة عامة على النظام والأنشطة الحديثة</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* إجمالي الموظفين */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.total_employees || 0)}</p>
              <p className="text-xs text-green-600">نشط: {formatNumber(stats?.active_employees || 0)}</p>
            </div>
          </div>
        </div>

        {/* الرخص النشطة */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الرخص النشطة</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.active_licenses || 0)}</p>
              <p className="text-xs text-yellow-600">تنتهي قريباً: {formatNumber(stats?.expiring_licenses || 0)}</p>
            </div>
          </div>
        </div>

        {/* الملفات الحديثة */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">الملفات المرفوعة</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.recent_documents || 0)}</p>
              <p className="text-xs text-blue-600">هذا الأسبوع</p>
            </div>
          </div>
        </div>

        {/* المهام المعلقة */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">المهام المعلقة</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(userTasks?.length || 0)}</p>
              <p className="text-xs text-gray-500">مهامك الحالية</p>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الأساسي */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* التنبيهات والانتهاءات القريبة */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-yellow-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              الانتهاءات القريبة
            </h3>
          </div>
          <div className="p-6">
            {expiryAlerts.length > 0 ? (
              <div className="space-y-3">
                {expiryAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={`${alert.entity_type}-${alert.id}`}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.alert_level)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs opacity-75 mt-1">{alert.entity_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium">
                          {alert.is_expired ? 'منتهي' : `${alert.days_until_expiry} يوم`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">لا توجد انتهاءات قريبة</p>
              </div>
            )}
          </div>
        </div>

        {/* الملفات المرفوعة حديثاً */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-blue-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              الملفات الحديثة
            </h3>
          </div>
          <div className="p-6">
            {recentFiles.length > 0 ? (
              <div className="space-y-3">
                {recentFiles.slice(0, 5).map((file) => (
                  <div key={file.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="mr-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{translateDocumentType(file.file_type)}</span>
                        <span className="mx-1">•</span>
                        <span>{translateEntityType(file.entity_type)}: {file.entity_name}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatRelativeTime(file.uploaded_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">لا توجد ملفات حديثة</p>
              </div>
            )}
          </div>
        </div>

        {/* مهام المستخدم المحسنة (للموظفين) */}
        {userTasks.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 lg:col-span-2">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  مهامك الحالية
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>
                    معلقة: {pendingTasks.length}
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full ml-1"></span>
                    قيد التنفيذ: {inProgressTasks.length}
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full ml-1"></span>
                    مكتملة: {completedTasks.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTasks.slice(0, 8).map((task) => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{task.title}</h4>
                      <div className="flex flex-col gap-1 ml-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTaskPriorityColor(task.priority)}`}>
                          {translateTaskPriority(task.priority)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTaskStatusColor(task.status)}`}>
                          {translateTaskStatus(task.status)}
                        </span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    {task.due_date && (
                      <p className="text-xs text-gray-500 mb-3">
                        <span className="inline-flex items-center">
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          الموعد النهائي: {formatRelativeTime(task.due_date)}
                        </span>
                      </p>
                    )}
                    
                    {/* أزرار العمليات */}
                    <div className="flex gap-2 mt-3">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                          disabled={taskActionLoading === task.id}
                          className="flex-1 px-3 py-2 text-xs bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors disabled:opacity-50"
                        >
                          {taskActionLoading === task.id ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              جاري البدء...
                            </span>
                          ) : (
                            'بدء العمل'
                          )}
                        </button>
                      )}
                      
                      {(task.status === 'pending' || task.status === 'in_progress') && (
                        <button
                          onClick={() => handleTaskStatusChange(task.id, 'completed')}
                          disabled={taskActionLoading === task.id}
                          className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          {taskActionLoading === task.id ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              جاري الإنجاز...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              تم الإنجاز
                            </span>
                          )}
                        </button>
                      )}
                      
                      {task.status === 'completed' && (
                        <div className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-800 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          مكتملة
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* رابط عرض جميع المهام */}
              {userTasks.length > 8 && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    عرض جميع المهام ({userTasks.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* رسالة عدم وجود مهام */}
        {userTasks.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 lg:col-span-2">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                المهام
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-500 mb-2">لا توجد مهام مسندة إليك حالياً</p>
                <p className="text-sm text-gray-400">ستظهر هنا المهام المسندة إليك من قبل المدير</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Overview
