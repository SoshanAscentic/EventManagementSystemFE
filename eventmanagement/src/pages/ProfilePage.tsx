import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage, Badge, Icon, Spinner } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Input } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'
import { useGetMyRegistrationsQuery } from '@/features/registrations/api/registrationsApi'
import { useGetProfileQuery, useUpdateProfileMutation } from '@/features/users/api/usersApi'
import { formatRelativeTime, formatEventDateTime } from '@/shared/utils/formatters'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMemo } from 'react'

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().optional(),
})

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

export const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch user's detailed profile
  const { 
    data: profileData, 
    isLoading: profileLoading, 
    refetch: refetchProfile 
  } = useGetProfileQuery()

  // Fetch user's registrations
  const { 
    data: registrationsData, 
    isLoading: registrationsLoading,
    error: registrationsError 
  } = useGetMyRegistrationsQuery({
    pageNumber: 1,
    pageSize: 20,
    ascending: false, // Most recent first
  })

  // Update profile mutation
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

  const profile = profileData?.data || user
  const registrations = registrationsData?.data?.items || []

  // Form for editing profile
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phoneNumber || '',
    }
  })

  // Update form when profile data loads
  useState(() => {
    if (profile) {
      setValue('firstName', profile.firstName || '')
      setValue('lastName', profile.lastName || '')
      setValue('phone', profile.phoneNumber || '')
    }
  })

  // Generate activity feed from registrations
  const activityFeed = useMemo(() => {
    if (!registrations.length) return []

    const activities = registrations.map(registration => ({
      id: `reg-${registration.id}`,
      type: registration.status === 'Cancelled' ? 'registration_cancelled' : 'registration',
      description: registration.status === 'Cancelled' 
        ? `Cancelled registration for ${registration.eventTitle}`
        : `Registered for ${registration.eventTitle}`,
      timestamp: registration.registeredAt,
      icon: registration.status === 'Cancelled' ? 'X' : 'Calendar',
      eventId: registration.eventId,
    }))

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
  }, [registrations])

  // Statistics from registrations
  const statistics = useMemo(() => {
    const totalRegistrations = registrations.length
    const activeRegistrations = registrations.filter(r => r.status === 'Active').length
    const attendedEvents = registrations.filter(r => r.attended === true).length
    const upcomingEvents = registrations.filter(r => 
      r.status === 'Active' && r.eventStartDateTime && new Date(r.eventStartDateTime) > new Date()
    ).length

    return {
      totalRegistrations,
      activeRegistrations,
      attendedEvents,
      upcomingEvents,
    }
  }, [registrations])

  const handleProfileUpdate = async (data: ProfileUpdateData) => {
    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      }).unwrap()
      
      setIsEditing(false)
      refetchProfile()
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    reset()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Lock" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <Button asChild>
            <Link to="/auth/login">
              <Icon name="LogIn" className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <Button onClick={() => refetchProfile()}>
            <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()

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
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <CardContent className="pt-20 pb-8 px-8">
                {isEditing ? (
                  /* Edit Form */
                  <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="First Name"
                        error={errors.firstName?.message}
                        required
                      >
                        <Input {...register('firstName')} />
                      </FormField>
                      <FormField
                        label="Last Name"
                        error={errors.lastName?.message}
                        required
                      >
                        <Input {...register('lastName')} />
                      </FormField>
                    </div>
                    <FormField
                      label="Phone Number"
                      error={errors.phone?.message}
                    >
                      <Input {...register('phone')} placeholder="Optional" />
                    </FormField>
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isUpdating ? (
                          <>
                            <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Profile Display */
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <p className="text-gray-600 mb-4 text-lg">{profile.email}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {profile.roles?.map((role: string) => (
                          <Badge key={role} className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                            {role}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="border-gray-300 text-gray-600 px-3 py-1">
                          <Icon name="Calendar" className="mr-1 h-3 w-3" />
                          Member since {profile.createdAt ? new Date(profile.createdAt).getFullYear() : 'Unknown'}
                        </Badge>
                      </div>

                      {/* User Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{statistics.totalRegistrations}</div>
                          <div className="text-xs text-blue-600">Total Events</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{statistics.upcomingEvents}</div>
                          <div className="text-xs text-green-600">Upcoming</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{statistics.attendedEvents}</div>
                          <div className="text-xs text-purple-600">Attended</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{statistics.activeRegistrations}</div>
                          <div className="text-xs text-orange-600">Active</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                        className="bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <Icon name="Edit" className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors"
                        asChild
                      >
                        <Link to="/registrations">
                          <Icon name="Calendar" className="mr-2 h-4 w-4" />
                          My Events
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
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
                  My Events ({statistics.totalRegistrations})
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
                    <CardTitle className="flex items-center justify-between text-xl">
                      <div className="flex items-center">
                        <Icon name="Calendar" className="mr-3 h-5 w-5 text-blue-600" />
                        Event Registrations
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/registrations">
                          View All
                        </Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {registrationsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : registrationsError ? (
                      <div className="text-center py-8">
                        <Icon name="AlertCircle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600">Unable to load your registrations.</p>
                      </div>
                    ) : registrations.length > 0 ? (
                      <div className="space-y-4">
                        {registrations.slice(0, 5).map((registration) => (
                          <div
                            key={registration.id}
                            className="flex items-center justify-between p-6 border border-gray-100 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300 hover:shadow-md"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                                {registration.eventTitle || 'Event Title Unavailable'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Icon name="Calendar" className="mr-1 h-4 w-4 text-blue-500" />
                                  {formatEventDateTime(registration.eventStartDateTime, registration.eventEndDateTime)}
                                </div>
                                <div className="flex items-center">
                                  <Icon name="MapPin" className="mr-1 h-4 w-4 text-red-500" />
                                  {registration.venue || 'Venue TBD'}
                                </div>
                                <div className="flex items-center">
                                  <Icon name="Clock" className="mr-1 h-4 w-4 text-green-500" />
                                  Registered {formatRelativeTime(registration.registeredAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge
                                className={
                                  registration.status === 'Active' 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : registration.status === 'Cancelled'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }
                              >
                                {registration.status || 'Unknown'}
                              </Badge>
                              <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                                <Link to={`/events/${registration.eventId}`}>
                                  View Event
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                        {registrations.length > 5 && (
                          <div className="text-center pt-4">
                            <Button variant="outline" asChild>
                              <Link to="/registrations">
                                View All {registrations.length} Events
                                <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Icon name="Calendar" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
                        <p className="text-gray-600 mb-6">You haven't registered for any events. Discover amazing events to join!</p>
                        <Button asChild>
                          <Link to="/events">
                            <Icon name="Search" className="mr-2 h-4 w-4" />
                            Browse Events
                          </Link>
                        </Button>
                      </div>
                    )}
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
                    {activityFeed.length > 0 ? (
                      <div className="space-y-4">
                        {activityFeed.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300 border border-gray-100 hover:border-blue-200">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center">
                              <Icon name={activity.icon as any} className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{activity.description}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatRelativeTime(activity.timestamp)}
                              </p>
                            </div>
                            {activity.eventId && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/events/${activity.eventId}`}>
                                  <Icon name="ExternalLink" className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Icon name="Activity" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                        <p className="text-gray-600">Your activity will appear here as you interact with events.</p>
                      </div>
                    )}
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
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30 border border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">New Events</p>
                            <p className="text-sm text-gray-600">Notifications for new events in your interests</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white hover:bg-orange-50 border-gray-200 hover:border-orange-300 transition-colors">
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Icon name="Shield" className="mr-2 h-5 w-5 text-green-500" />
                        Privacy & Security
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-green-50/30 border border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">Profile Visibility</p>
                            <p className="text-sm text-gray-600">Control who can see your profile information</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white hover:bg-green-50 border-gray-200 hover:border-green-300 transition-colors">
                            Private
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-green-50/30 border border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">Password</p>
                            <p className="text-sm text-gray-600">Change your account password</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white hover:bg-green-50 border-gray-200 hover:border-green-300 transition-colors">
                            Change
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