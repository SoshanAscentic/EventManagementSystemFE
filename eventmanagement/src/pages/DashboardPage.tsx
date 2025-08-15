import { Link } from 'react-router-dom'
import { StatCard } from '@/components/molecules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Icon, Spinner } from '@/components/atoms'
import { useGetDashboardQuery, useGetCapacityAlertsQuery } from '@/features/admin/api/adminApi'
import { formatNumber, formatRelativeTime } from '@/shared/utils/formatters'
import { useAppSelector } from '@/app/hooks'

export const DashboardPage = () => {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardQuery()
  const { data: alertsData } = useGetCapacityAlertsQuery({ threshold: 0.8 })
  
  // Get notifications from Redux store
  const { notifications } = useAppSelector(state => state.notifications)

  const dashboard = dashboardData?.data
  const alerts = alertsData?.data || []

  // Debug logging
  console.log('All notifications:', notifications)
  console.log('Notifications length:', notifications?.length)
  
  // Log all notification types to see what we're working with
  if (notifications?.length > 0) {
    console.log('All notification types:', notifications.map(n => n.type))
  }

  // More flexible filtering - look for registration-related keywords
  const recentRegistrationNotifications = notifications
    ?.filter(notification => {
      // Ensure notification.type is a string before calling toLowerCase
      const type = typeof notification.type === 'string' ? notification.type.toLowerCase() : ''
      const message = typeof notification.message === 'string' ? notification.message.toLowerCase() : ''
      
      // Check for registration-related keywords in type or message
      const isRegistrationRelated = 
        type.includes('registration') || 
        message.includes('registration') ||
        message.includes('registered') ||
        message.includes('cancelled') ||
        type.includes('confirmed') ||
        type.includes('cancelled')
      
      const isRecent = Date.now() - notification.timestamp < 24 * 60 * 60 * 1000
      
      console.log('Notification check:', {
        type: notification.type,
        typeString: type,
        message: notification.message,
        messageString: message,
        isRegistrationRelated,
        isRecent
      })
      
      return isRegistrationRelated && isRecent
    })
    ?.sort((a, b) => b.timestamp - a.timestamp) // Most recent first
    ?.slice(0, 5) || [] // Show only last 5

  console.log('Filtered recent registration notifications:', recentRegistrationNotifications)
  console.log('Recent registrations count:', recentRegistrationNotifications.length)

  if (dashboardLoading) {
    return (
      <div className="min-h-[50vh] sm:min-h-[60vh] lg:min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center px-4">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (dashboardError || !dashboard) {
    return (
      <div className="min-h-[50vh] sm:min-h-[60vh] lg:min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="relative space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="text-center">
            <Icon name="AlertCircle" className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h1>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">There was an error loading the dashboard data.</p>
            <Button onClick={() => window.location.reload()}>
              <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const dashboardStats = [
    {
      title: 'Total Events',
      value: formatNumber(dashboard.totalEvents),
      icon: 'Calendar' as const,
    },
    {
      title: 'Active Users',
      value: formatNumber(dashboard.totalUsers),
      icon: 'Users' as const,
    },
    {
      title: 'Total Registrations',
      value: formatNumber(dashboard.totalRegistrations),
      icon: 'UserCheck' as const,
    },
    {
      title: 'Active Events',
      value: formatNumber(dashboard.activeEvents),
      icon: 'TrendingUp' as const,
    },
  ]

  return (
    <div className="min-h-[50vh] sm:min-h-[60vh] lg:min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl sm:rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-20 sm:top-40 right-8 sm:right-20 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
      </div>

      <div className="relative space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-0">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
              Admin 
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                Dashboard
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
              Welcome back! Here's what's happening with your events.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
          {dashboardStats.map((stat, index) => (
            <div key={stat.title} className="animate-fade-in" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
              <StatCard 
                {...stat} 
                className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/20 p-3 sm:p-4 lg:p-6"
              />
            </div>
          ))}
        </div>

        {/* Capacity Alerts */}
        {alerts.length > 0 && (
          <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center text-lg sm:text-xl gap-2">
                  <div className="flex items-center">
                    <Icon name="AlertTriangle" className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
                    Capacity Alerts
                  </div>
                  <Badge variant="destructive" className="self-start sm:ml-2 text-xs">{alerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {alerts.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-orange-100 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-50 to-red-50/30 hover:from-orange-100 hover:to-red-50/50 transition-all duration-300 space-y-3 sm:space-y-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base truncate">{event.title}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center">
                            <Icon name="Calendar" className="mr-1 h-3 w-3 text-blue-500 shrink-0" />
                            <span className="truncate">{new Date(event.startDateTime).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Icon name="Users" className="mr-1 h-3 w-3 text-orange-500 shrink-0" />
                            <span>{event.currentRegistrations}/{event.capacity}</span>
                          </div>
                          <div className="flex items-center">
                            <Icon name="AlertTriangle" className="mr-1 h-3 w-3 text-red-500 shrink-0" />
                            <span>{event.remainingCapacity} spots left</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0" asChild>
                        <Link to={`/events/${event.id}`}>
                          <Icon name="Eye" className="mr-2 h-3 w-3" />
                          <span className="sm:hidden">View</span>
                          <span className="hidden sm:inline">View Event</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Registrations - Only show if there are recent registration notifications */}
          {recentRegistrationNotifications.length > 0 && (
            <div className="xl:col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center">
                      <Icon name="UserPlus" className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      Registration Activity
                    </div>
                    <Badge className="self-start sm:ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                      {recentRegistrationNotifications.length} recent
                    </Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                    <Link to="/admin/registrations">
                      <span className="sm:hidden">View All</span>
                      <span className="hidden sm:inline">View All</span>
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentRegistrationNotifications.map((notification) => {
                      const isCancellation = (typeof notification.type === 'string' ? notification.type.toLowerCase().includes('cancel') : false) || 
                                           (typeof notification.message === 'string' ? notification.message.toLowerCase().includes('cancel') : false)
                      
                      return (
                        <div
                          key={notification.id}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg sm:rounded-xl transition-all duration-300 space-y-3 sm:space-y-0 ${
                            isCancellation 
                              ? 'border-red-100 bg-gradient-to-r from-red-50 to-pink-50/30 hover:from-red-100 hover:to-pink-50/50' 
                              : 'border-gray-100 bg-gradient-to-r from-gray-50 to-green-50/30 hover:from-white hover:to-green-50/50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base truncate">
                              {notification.data?.eventTitle || notification.title || 'Event Registration'}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center">
                                <Icon 
                                  name={isCancellation ? "UserMinus" : "UserPlus"} 
                                  className={`mr-1 h-3 w-3 shrink-0 ${isCancellation ? 'text-red-500' : 'text-green-500'}`} 
                                />
                                <span className="text-gray-700 truncate">
                                  {notification.data?.userName || (isCancellation ? 'Registration Cancelled' : 'New Registration')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Icon name="Clock" className="mr-1 h-3 w-3 text-blue-500 shrink-0" />
                                <span>{formatRelativeTime(new Date(notification.timestamp))}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                          </div>
                          {notification.data?.eventId && (
                            <Button variant="outline" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0" asChild>
                              <Link to={`/events/${notification.data.eventId}`}>
                                <Icon name="Eye" className="mr-2 h-3 w-3" />
                                <span className="sm:hidden">View</span>
                                <span className="hidden sm:inline">View Event</span>
                              </Link>
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Temporary: Show all recent notifications if no registration ones found */}
          {recentRegistrationNotifications.length === 0 && notifications?.length > 0 && (
            <div className="xl:col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center">
                      <Icon name="Bell" className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                      All Recent Notifications (Debug)
                    </div>
                    <Badge className="self-start sm:ml-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      {notifications.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300 space-y-3 sm:space-y-0"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                            Type: {notification.type}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center">
                              <Icon name="Info" className="mr-1 h-3 w-3 text-blue-500 shrink-0" />
                              <span className="text-gray-700 line-clamp-2">{notification.message}</span>
                            </div>
                            <div className="flex items-center">
                              <Icon name="Clock" className="mr-1 h-3 w-3 text-green-500 shrink-0" />
                              <span>{formatRelativeTime(new Date(notification.timestamp))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-4 sm:space-y-6">
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Icon name="Zap" className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base" asChild>
                    <Link to="/admin/events/create">
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Create New Event
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors text-sm sm:text-base" asChild>
                    <Link to="/admin/events">
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      Manage Events
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors text-sm sm:text-base" asChild>
                    <Link to="/admin/users">
                      <Icon name="Users" className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors text-sm sm:text-base" asChild>
                    <Link to="/admin/categories">
                      <Icon name="Folder" className="mr-2 h-4 w-4" />
                      Manage Categories
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Popular Events */}
            {dashboard.popularEvents?.length > 0 && (
              <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                      <Icon name="TrendingUp" className="mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
                      Popular Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.popularEvents.slice(0, 3).map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50/50 border border-purple-100">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h4>
                          <p className="text-xs text-gray-500">{event.registrationCount} registrations</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 ml-2 shrink-0 text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}