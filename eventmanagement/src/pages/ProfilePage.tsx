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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const userInitials = `${user.firstName[0]}${user.lastName[0]}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-30"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="animate-fade-in mb-12">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-32 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute -bottom-16 left-8">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <CardContent className="pt-20 pb-8 px-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-600 mb-4 text-lg">{user.email}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.roles.map((role: string) => (
                        <Badge key={role} className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                          {role}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="border-gray-300 text-gray-600 px-3 py-1">
                        <Icon name="Calendar" className="mr-1 h-3 w-3" />
                        Member since {new Date(user.createdAt).getFullYear()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
                      <Icon name="Edit" className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
                      <Icon name="Settings" className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Tabs */}
          <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Tabs defaultValue="registrations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-md border border-white/20">
                <TabsTrigger 
                  value="registrations"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                >
                  My Registrations
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                >
                  Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="registrations" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Icon name="Calendar" className="mr-3 h-5 w-5 text-blue-600" />
                      Event Registrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockRegistrations.map((registration) => (
                        <div
                          key={registration.id}
                          className="flex items-center justify-between p-6 border border-gray-100 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                              {registration.eventTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Icon name="Calendar" className="mr-1 h-4 w-4 text-blue-500" />
                                {new Date(registration.eventDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Icon name="MapPin" className="mr-1 h-4 w-4 text-red-500" />
                                {registration.venue}
                              </div>
                              <div className="flex items-center">
                                <Icon name="Clock" className="mr-1 h-4 w-4 text-green-500" />
                                Registered {new Date(registration.registeredAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={
                                registration.status === 'Active' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }
                            >
                              {registration.status}
                            </Badge>
                            <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                              View Event
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Icon name="Activity" className="mr-3 h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300 border border-gray-100 hover:border-blue-200">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center">
                            <Icon name={activity.icon as any} className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{activity.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
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

              <TabsContent value="preferences" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Icon name="Settings" className="mr-3 h-5 w-5 text-blue-600" />
                      Account Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Icon name="Bell" className="mr-2 h-5 w-5 text-orange-500" />
                        Email Notifications
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30 border border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">Event Reminders</p>
                            <p className="text-sm text-gray-600">Get notified before events start</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white hover:bg-orange-50 border-gray-200 hover:border-orange-300 transition-colors">
                            Toggle
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30 border border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">New Events</p>
                            <p className="text-sm text-gray-600">Notifications for new events in your interests</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white hover:bg-orange-50 border-gray-200 hover:border-orange-300 transition-colors">
                            Toggle
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Icon name="Shield" className="mr-2 h-5 w-5 text-green-500" />
                        Privacy
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-green-50/30 border border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">Profile Visibility</p>
                            <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white hover:bg-green-50 border-gray-200 hover:border-green-300 transition-colors">
                            Public
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}