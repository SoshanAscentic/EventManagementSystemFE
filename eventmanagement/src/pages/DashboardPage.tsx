import { StatCard } from '@/components/molecules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Icon } from '@/components/atoms'

const dashboardStats = [
  {
    title: 'Total Events',
    value: '1,234',
    change: { value: 12, trend: 'up' as const },
    icon: 'Calendar' as const,
  },
  {
    title: 'Active Users',
    value: '5,678',
    change: { value: 8, trend: 'up' as const },
    icon: 'Users' as const,
  },
  {
    title: 'This Month',
    value: '89',
    change: { value: 15, trend: 'up' as const },
    icon: 'TrendingUp' as const,
  },
  {
    title: 'Revenue',
    value: '$12,345',
    change: { value: 3, trend: 'down' as const },
    icon: 'DollarSign' as const,
  },
]

const recentEvents = [
  {
    id: 1,
    title: 'React Conference 2024',
    date: '2024-10-15',
    registrations: 450,
    capacity: 500,
    status: 'Active',
  },
  {
    id: 2,
    title: 'Digital Marketing Workshop',
    date: '2024-10-20',
    registrations: 75,
    capacity: 100,
    status: 'Active',
  },
  {
    id: 3,
    title: 'Art Gallery Opening',
    date: '2024-10-25',
    registrations: 100,
    capacity: 200,
    status: 'Draft',
  },
]

export const DashboardPage = () => {
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

        {/* Recent Events and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl flex items-center">
                  <Icon name="Calendar" className="mr-3 h-5 w-5 text-blue-600" />
                  Recent Events
                </CardTitle>
                <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Icon name="Calendar" className="mr-1 h-3 w-3 text-blue-500" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Icon name="Users" className="mr-1 h-3 w-3 text-green-500" />
                            {event.registrations}/{event.capacity} registered
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <Badge
                          className={
                            event.status === 'Active' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {event.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors">
                          <Icon name="MoreHorizontal" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Icon name="Zap" className="mr-3 h-5 w-5 text-orange-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300">
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Create New Event
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
                    <Icon name="Users" className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
                    <Icon name="Folder" className="mr-2 h-4 w-4" />
                    Manage Categories
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
                    <Icon name="BarChart3" className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
                    <Icon name="Settings" className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Icon name="Activity" className="mr-3 h-5 w-5 text-green-500" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-100">
                    <span className="text-sm font-medium text-gray-700">Database</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Icon name="CheckCircle" className="mr-1 h-3 w-3" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-100">
                    <span className="text-sm font-medium text-gray-700">API</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Icon name="CheckCircle" className="mr-1 h-3 w-3" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50/50 border border-yellow-100">
                    <span className="text-sm font-medium text-gray-700">Storage</span>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Icon name="AlertTriangle" className="mr-1 h-3 w-3" />
                      85% Full
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}