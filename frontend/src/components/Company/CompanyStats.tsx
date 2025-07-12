import React, { useState, useEffect } from 'react'

interface CompanyStatsProps {
  companyId: number
}

interface Stats {
  totalEmployees: number
  activeEmployees: number
  totalLicenses: number
  expiringLicenses: number
  pendingTasks: number
  completedTasks: number
}

const CompanyStats: React.FC<CompanyStatsProps> = ({ companyId }) => {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalLicenses: 0,
    expiringLicenses: 0,
    pendingTasks: 0,
    completedTasks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // جلب إحصائيات العمال (مثال مؤقت)
        const totalEmployees = 150
        const activeEmployees = 142
        
        // جلب إحصائيات التراخيص (مثال مؤقت)
        const totalLicenses = 85
        const expiringLicenses = 12
        
        // جلب إحصائيات المهام (مثال مؤقت)
        const pendingTasks = 24
        const completedTasks = 186

        setStats({
          totalEmployees,
          activeEmployees,
          totalLicenses,
          expiringLicenses,
          pendingTasks,
          completedTasks
        })

      } catch (error) {
        console.error('Error fetching company stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [companyId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
                <div className="mr-5 w-0 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'إجمالي العمال',
      value: stats.totalEmployees,
      change: `${stats.activeEmployees} نشط`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'التراخيص',
      value: stats.totalLicenses,
      change: `${stats.expiringLicenses} تنتهي قريباً`,
      changeType: stats.expiringLicenses > 0 ? 'negative' : 'neutral',
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'المهام المعلقة',
      value: stats.pendingTasks,
      change: `${stats.completedTasks} مكتملة`,
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    }
  ]

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">إحصائيات الشركة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.iconBg} rounded-md p-3`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value.toLocaleString()}
                      </div>
                    </dd>
                    <dd className="flex items-baseline">
                      <div className={`text-sm ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600' 
                          : stat.changeType === 'negative' 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CompanyStats
