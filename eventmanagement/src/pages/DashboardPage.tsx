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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (dashboardError || !dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="relative space-y-8 p-8">
          <div className="text-center">
            <Icon name="AlertCircle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h1>
            <p className="text-gray-600 mb-4">There was an error loading the dashboard data.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
      </div>

      <div className="relative space-y-8 p-8">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Admin 
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                Dashboard
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back! Here's what's happening with your events.
            </p>
          </div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
          {dashboardStats.map((stat, index) => (
            <div key={stat.title} className="animate-fade-in" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
              <StatCard 
                {...stat} 
                className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/20"
              />
            </div>
          ))}
        </div>

        {/* Capacity Alerts */}
        {alerts.length > 0 && (
          <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Icon name="AlertTriangle" className="mr-3 h-5 w-5 text-orange-500" />
                  Capacity Alerts
                  <Badge variant="destructive" className="ml-2">{alerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border border-orange-100 rounded-xl bg-gradient-to-r from-orange-50 to-red-50/30 hover:from-orange-100 hover:to-red-50/50 transition-all duration-300"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Icon name="Calendar" className="mr-1 h-3 w-3 text-blue-500" />
                            {new Date(event.startDateTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Icon name="Users" className="mr-1 h-3 w-3 text-orange-500" />
                            {event.currentRegistrations}/{event.capacity}
                          </div>
                          <div className="flex items-center">
                            <Icon name="AlertTriangle" className="mr-1 h-3 w-3 text-red-500" />
                            {event.remainingCapacity} spots left
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/events/${event.id}`}>
                          View Event
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Registrations - Only show if there are recent registration notifications */}
          {recentRegistrationNotifications.length > 0 && (
            <div className="lg:col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <Icon name="UserPlus" className="mr-3 h-5 w-5 text-green-600" />
                    Registration Activity
                    <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                      {recentRegistrationNotifications.length} recent
                    </Badge>
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/registrations">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRegistrationNotifications.map((notification) => {
                      const isCancellation = (typeof notification.type === 'string' ? notification.type.toLowerCase().includes('cancel') : false) || 
                                           (typeof notification.message === 'string' ? notification.message.toLowerCase().includes('cancel') : false)
                      
                      return (
                        <div
                          key={notification.id}
                          className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-300 ${
                            isCancellation 
                              ? 'border-red-100 bg-gradient-to-r from-red-50 to-pink-50/30 hover:from-red-100 hover:to-pink-50/50' 
                              : 'border-gray-100 bg-gradient-to-r from-gray-50 to-green-50/30 hover:from-white hover:to-green-50/50'
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {notification.data?.eventTitle || notification.title || 'Event Registration'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Icon 
                                  name={isCancellation ? "UserMinus" : "UserPlus"} 
                                  className={`mr-1 h-3 w-3 ${isCancellation ? 'text-red-500' : 'text-green-500'}`} 
                                />
                                <span className="text-gray-700">
                                  {notification.data?.userName || (isCancellation ? 'Registration Cancelled' : 'New Registration')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Icon name="Clock" className="mr-1 h-3 w-3 text-blue-500" />
                                {formatRelativeTime(new Date(notification.timestamp))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          </div>
                          {notification.data?.eventId && (
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/events/${notification.data.eventId}`}>
                                View Event
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
            <div className="lg:col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-xl flex items-center">
                    <Icon name="Bell" className="mr-3 h-5 w-5 text-blue-600" />
                    All Recent Notifications (Debug)
                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                      {notifications.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Type: {notification.type}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Icon name="Info" className="mr-1 h-3 w-3 text-blue-500" />
                              <span className="text-gray-700">{notification.message}</span>
                            </div>
                            <div className="flex items-center">
                              <Icon name="Clock" className="mr-1 h-3 w-3 text-green-500" />
                              {formatRelativeTime(new Date(notification.timestamp))}
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
          <div className={`space-y-6 ${recentRegistrationNotifications.length === 0 ? 'lg:col-span-1' : ''}`}>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Icon name="Zap" className="mr-3 h-5 w-5 text-orange-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300" asChild>
                    <Link to="/admin/events/create">
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Create New Event
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors" asChild>
                    <Link to="/admin/events">
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      Manage Events
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors" asChild>
                    <Link to="/admin/users">
                      <Icon name="Users" className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors" asChild>
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
                    <CardTitle className="text-xl flex items-center">
                      <Icon name="TrendingUp" className="mr-3 h-5 w-5 text-purple-500" />
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
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
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