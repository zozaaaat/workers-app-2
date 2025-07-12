import { useState, useEffect } from 'react'
import { overviewService, tasksService } from '../services'
import { OverviewStats, ExpiryAlert, RecentFile, Task } from '../types'

export const useOverviewData = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([])
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])
  const [userTasks, setUserTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskLoading, setTaskLoading] = useState<number | null>(null)

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      setError(null)

      // جلب البيانات بشكل متوازي
      const [statsData, alertsData, filesData, tasksData] = await Promise.allSettled([
        overviewService.getStats(),
        overviewService.getExpiryAlerts(5),
        overviewService.getRecentFiles(5),
        tasksService.getMyTasks(),
      ])

      // معالجة النتائج
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value)
      }

      if (alertsData.status === 'fulfilled') {
        setExpiryAlerts(alertsData.value)
      }

      if (filesData.status === 'fulfilled') {
        setRecentFiles(filesData.value)
      }

      if (tasksData.status === 'fulfilled') {
        setUserTasks(tasksData.value)
      }

      // إذا فشل جلب الإحصائيات الأساسية
      if (statsData.status === 'rejected') {
        setError('فشل في تحميل إحصائيات لوحة التحكم')
      }

    } catch (err) {
      setError('حدث خطأ في تحميل البيانات')
      console.error('Overview data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // تحديث حالة المهمة
  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      setTaskLoading(taskId)
      
      // تحديث المهمة في الخادم
      const updatedTask = await tasksService.updateStatus(taskId, status)
      
      // تحديث المهمة في الحالة المحلية
      setUserTasks((prevTasks: Task[]) => 
        prevTasks.map((task: Task) => 
          task.id === taskId ? updatedTask : task
        )
      )
      
      return updatedTask
    } catch (error) {
      console.error('Error updating task status:', error)
      throw error
    } finally {
      setTaskLoading(null)
    }
  }

  // تعيين المهمة كمكتملة
  const markTaskAsCompleted = async (taskId: number) => {
    return updateTaskStatus(taskId, 'completed')
  }

  // تعيين المهمة كقيد التنفيذ
  const markTaskAsInProgress = async (taskId: number) => {
    return updateTaskStatus(taskId, 'in_progress')
  }

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const refetch = () => {
    fetchOverviewData()
  }

  return {
    stats,
    expiryAlerts,
    recentFiles,
    userTasks,
    loading,
    error,
    taskLoading,
    refetch,
    updateTaskStatus,
    markTaskAsCompleted,
    markTaskAsInProgress,
  }
}
