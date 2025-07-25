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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your events.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Events and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Events</CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>{event.registrations}/{event.capacity} registered</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={event.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {event.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
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
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Users" className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Folder" className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="BarChart3" className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Settings" className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Icon name="CheckCircle" className="mr-1 h-3 w-3" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Icon name="CheckCircle" className="mr-1 h-3 w-3" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Icon name="AlertTriangle" className="mr-1 h-3 w-3" />
                  85% Full
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
