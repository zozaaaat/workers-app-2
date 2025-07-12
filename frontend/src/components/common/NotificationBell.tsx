import React, { useState, useEffect, useRef } from 'react'

interface Notification {
  id: number
  title: string
  message: string
  type: 'license_expiry' | 'residency_expiry' | 'task_assigned' | 'document_missing' | 'warning' | 'error' | 'success'
  timestamp: string
  read: boolean
  entityType?: 'employee' | 'license' | 'task' | 'document'
  entityId?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  expiryDate?: string
  daysUntilExpiry?: number
}

const NotificationBell: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        },
      })

      if (!response.ok) {
        throw new Error('فشل في جلب الإشعارات')
      }

      const data = await response.json()
      
      // Process and categorize notifications
      const processedNotifications = data.map((notification: any) => ({
        ...notification,
        timestamp: new Date(notification.created_at).toLocaleString('ar-SA'),
      }))

      setNotifications(processedNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('فشل في جلب الإشعارات')
      
      // Use mock data as fallback
      setNotifications([
        {
          id: 1,
          title: 'انتهاء صلاحية ترخيص قريباً',
          message: 'ترخيص العمل للعامل أحمد محمد سينتهي خلال 7 أيام',
          type: 'license_expiry',
          timestamp: new Date().toLocaleString('ar-SA'),
          read: false,
          entityType: 'license',
          entityId: 123,
          priority: 'urgent',
          expiryDate: '2025-07-19',
          daysUntilExpiry: 7
        },
        {
          id: 2,
          title: 'انتهاء صلاحية الإقامة قريباً',
          message: 'إقامة العامل محمد علي ستنتهي خلال 15 يوم',
          type: 'residency_expiry',
          timestamp: new Date().toLocaleString('ar-SA'),
          read: false,
          entityType: 'employee',
          entityId: 456,
          priority: 'high',
          expiryDate: '2025-07-27',
          daysUntilExpiry: 15
        },
        {
          id: 3,
          title: 'مهمة جديدة',
          message: 'تم تعيين مهمة "مراجعة ملفات الموظفين" إليك',
          type: 'task_assigned',
          timestamp: new Date().toLocaleString('ar-SA'),
          read: false,
          entityType: 'task',
          entityId: 789,
          priority: 'medium'
        },
        {
          id: 4,
          title: 'وثائق مفقودة',
          message: 'الوثائق المطلوبة للعامل فاطمة أحمد غير مكتملة (جواز السفر، شهادة طبية)',
          type: 'document_missing',
          timestamp: new Date().toLocaleString('ar-SA'),
          read: false,
          entityType: 'employee',
          entityId: 101,
          priority: 'high'
        },
        {
          id: 5,
          title: 'تنبيه هام',
          message: 'يجب تجديد الرخصة التجارية للشركة خلال الشهر القادم',
          type: 'license_expiry',
          timestamp: new Date().toLocaleString('ar-SA'),
          read: true,
          entityType: 'license',
          entityId: 999,
          priority: 'high',
          expiryDate: '2025-08-12',
          daysUntilExpiry: 30
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh notifications every 5 minutes
  useEffect(() => {
    fetchNotifications()
    
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const unreadCount = notifications.filter((n: Notification) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications((prev: Notification[]) => 
      prev.map((notification: Notification) => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev: Notification[]) => 
      prev.map((notification: Notification) => ({ ...notification, read: true }))
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'license_expiry':
      case 'residency_expiry':
        return '⚠️'
      case 'task_assigned':
        return '📋'
      case 'document_missing':
        return '📄'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="الإشعارات"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9c0-3.866-3.134-7-7-7S1 5.134 1 9v3l-5 5h5m12 0a3 3 0 11-6 0m6 0H9" />
        </svg>
        
        {/* عداد الإشعارات غير المقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* رأس الإشعارات */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* قائمة الإشعارات */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                جاري تحميل الإشعارات...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                لا توجد إشعارات جديدة
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.priority)}`}>
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {notification.daysUntilExpiry !== undefined && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.daysUntilExpiry <= 7 
                                ? 'bg-red-100 text-red-700' 
                                : notification.daysUntilExpiry <= 30 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-green-100 text-green-700'
                            }`}>
                              {notification.daysUntilExpiry} يوم
                            </span>
                          )}
                          {notification.priority && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === 'urgent' 
                                ? 'bg-red-100 text-red-700' 
                                : notification.priority === 'high' 
                                  ? 'bg-orange-100 text-orange-700' 
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                              {notification.priority === 'urgent' ? 'عاجل' : 
                               notification.priority === 'high' ? 'مهم' : 'متوسط'}
                            </span>
                          )}
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {notification.timestamp}
                        </p>
                        {notification.entityType && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {notification.entityType === 'license' ? 'ترخيص' :
                             notification.entityType === 'employee' ? 'موظف' :
                             notification.entityType === 'task' ? 'مهمة' : notification.entityType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* تذييل الإشعارات */}
          <div className="p-3 border-t border-gray-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
              عرض جميع الإشعارات
            </button>
          </div>
        </div>
      )}

      {/* خلفية لإغلاق القائمة */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell
