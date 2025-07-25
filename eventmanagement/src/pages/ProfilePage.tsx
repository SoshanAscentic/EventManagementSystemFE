import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage, Badge, Icon } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'

const mockRegistrations = [
  {
    id: 1,
    eventTitle: 'React Conference 2024',
    eventDate: '2024-10-15T09:00:00',
    venue: 'Tech Center',
    status: 'Active',
    registeredAt: '2024-09-01T10:00:00',
  },
  {
    id: 2,
    eventTitle: 'Digital Marketing Workshop',
    eventDate: '2024-09-25T14:00:00',
    venue: 'Business Hub',
    status: 'Completed',
    registeredAt: '2024-08-15T15:30:00',
  },
]

const mockActivity = [
  {
    id: 1,
    type: 'registration',
    description: 'Registered for React Conference 2024',
    timestamp: '2024-09-01T10:00:00',
    icon: 'Calendar',
  },
  {
    id: 2,
    type: 'profile_update',
    description: 'Updated profile information',
    timestamp: '2024-08-20T14:30:00',
    icon: 'User',
  },
  {
    id: 3,
    type: 'event_attended',
    description: 'Attended Digital Marketing Workshop',
    timestamp: '2024-08-15T18:00:00',
    icon: 'CheckCircle',
  },
]

export const ProfilePage = () => {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  const userInitials = `${user.firstName[0]}${user.lastName[0]}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.roles.map((role: string) => (
                    <Badge key={role} variant="secondary">{role}</Badge>
                  ))}
                  <Badge variant="outline">
                    <Icon name="Calendar" className="mr-1 h-3 w-3" />
                    Member since {new Date(user.createdAt).getFullYear()}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Icon name="Edit" className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline">
                  <Icon name="Settings" className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="registrations">My Registrations</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRegistrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {registration.eventTitle}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Icon name="Calendar" className="mr-1 h-3 w-3" />
                            {new Date(registration.eventDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Icon name="MapPin" className="mr-1 h-3 w-3" />
                            {registration.venue}
                          </div>
                          <div className="flex items-center">
                            <Icon name="Clock" className="mr-1 h-3 w-3" />
                            Registered {new Date(registration.registeredAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={registration.status === 'Active' ? 'default' : 'secondary'}
                        >
                          {registration.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Event
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name={activity.icon as any} className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Event Reminders</p>
                        <p className="text-xs text-gray-500">Get notified before events start</p>
                      </div>
                      <Button variant="outline" size="sm">Toggle</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">New Events</p>
                        <p className="text-xs text-gray-500">Notifications for new events in your interests</p>
                      </div>
                      <Button variant="outline" size="sm">Toggle</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Privacy</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Profile Visibility</p>
                        <p className="text-xs text-gray-500">Make your profile visible to other users</p>
                      </div>
                      <Button variant="outline" size="sm">Public</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}