import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge, Icon, Spinner } from '@/components/atoms'
import { useGetMyRegistrationsQuery, useCancelRegistrationMutation } from '@/features/registrations/api/registrationsApi'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Link } from 'react-router-dom'
import { formatEventDateTime, formatRelativeTime } from '@/shared/utils/formatters'

export const MyRegistrationsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  // Fetch registrations with required parameters
  const { 
    data: registrationsData, 
    isLoading, 
    error,
    refetch
  } = useGetMyRegistrationsQuery({
    pageNumber: 1,
    pageSize: 100, // Get more for client-side filtering
    ascending: false, // Most recent first - REQUIRED PARAMETER
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const [cancelRegistration, { isLoading: isCancelling }] = useCancelRegistrationMutation()

  const allRegistrations = registrationsData?.data?.items || []

  // Client-side filtering for timeframe
  const filteredRegistrations = useMemo(() => {
    let filtered = allRegistrations

    // Filter by timeframe
    if (timeframeFilter === 'upcoming') {
      filtered = filtered.filter(reg => 
        new Date(reg.eventStartDateTime) > new Date() && reg.status === 'Registered'
      )
    } else if (timeframeFilter === 'past') {
      filtered = filtered.filter(reg => 
        new Date(reg.eventStartDateTime) <= new Date()
      )
    }

    return filtered
  }, [allRegistrations, timeframeFilter])

  // Get statistics for display
  const statistics = useMemo(() => {
    const totalRegistrations = allRegistrations.length
    const activeRegistrations = allRegistrations.filter(r => r.status === 'Registered').length
    const attendedEvents = allRegistrations.filter(r => r.attended === true).length
    const upcomingEvents = allRegistrations.filter(r => 
      r.status === 'Registered' && r.eventStartDateTime && new Date(r.eventStartDateTime) > new Date()
    ).length

    return {
      totalRegistrations,
      activeRegistrations,
      attendedEvents,
      upcomingEvents,
    }
  }, [allRegistrations])

  const handleCancelRegistration = async (registrationId: number) => {
    try {
      await cancelRegistration({ 
        registrationId, 
        reason: 'User requested cancellation from my registrations page' 
      }).unwrap()
      setCancellingId(null)
      // The cache will be invalidated automatically
    } catch (error) {
      console.error('Failed to cancel registration:', error)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading your registrations...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Icon name="AlertCircle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Registrations</h1>
            <p className="text-gray-600 mb-6">
              We're having trouble loading your registrations. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-30"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header with Statistics */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              My Event
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                Registrations
              </span>
            </h1>
            <p className="text-lg text-gray-600">Manage all your event registrations in one place</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.totalRegistrations}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{statistics.upcomingEvents}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{statistics.attendedEvents}</div>
                <div className="text-sm text-gray-600">Attended</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{statistics.activeRegistrations}</div>
                <div className="text-sm text-gray-600">Active</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter Your Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                  <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="upcoming">Upcoming Events</SelectItem>
                      <SelectItem value="past">Past Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Attended">Attended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    Showing {filteredRegistrations.length} of {allRegistrations.length} registrations
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {filteredRegistrations.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <Icon name="Calendar" className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {allRegistrations.length === 0 ? 'No registrations found' : 'No registrations match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {allRegistrations.length === 0 
                  ? "You haven't registered for any events yet. Discover amazing events to join!"
                  : "Try adjusting your filters to see more registrations."
                }
              </p>
              {allRegistrations.length === 0 ? (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Link to="/events">
                    <Icon name="Search" className="mr-2 h-4 w-4" />
                    Browse Events
                  </Link>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFilter('all')
                    setTimeframeFilter('all')
                  }}
                  className="bg-white hover:bg-gray-50"
                >
                  <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((registration, index) => (
              <Card 
                key={registration.id} 
                className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {registration.eventTitle}
                        </h3>
                        <Badge
                          className={
                            registration.status === 'Registered' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : registration.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : registration.status === 'Attended'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {registration.status}
                        </Badge>
                        {registration.attended && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <Icon name="Award" className="mr-1 h-3 w-3" />
                            Attended
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Icon name="Calendar" className="h-4 w-4 mr-2 text-blue-500" />
                            {formatEventDateTime(registration.eventStartDateTime, registration.eventEndDateTime)}
                          </div>
                          <div className="flex items-center">
                            <Icon name="MapPin" className="h-4 w-4 mr-2 text-red-500" />
                            {registration.venue}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Icon name="Clock" className="h-4 w-4 mr-2 text-green-500" />
                            Registered {formatRelativeTime(registration.registeredAt)}
                          </div>
                          {registration.cancelledAt && (
                            <div className="flex items-center">
                              <Icon name="X" className="h-4 w-4 mr-2 text-red-500" />
                              Cancelled {formatRelativeTime(registration.cancelledAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Event Status Info */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Icon name="Hash" className="h-3 w-3 mr-1" />
                          Registration ID: {registration.id}
                        </div>
                        {new Date(registration.eventStartDateTime) > new Date() ? (
                          <div className="flex items-center text-green-600">
                            <Icon name="Clock" className="h-3 w-3 mr-1" />
                            Upcoming Event
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <Icon name="CheckCircle" className="h-3 w-3 mr-1" />
                            Past Event
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                        <Link to={`/events/${registration.eventId}`}>
                          <Icon name="Eye" className="h-4 w-4 mr-1" />
                          View Event
                        </Link>
                      </Button>
                      
                      {registration.status === 'Registered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-600 transition-colors"
                          onClick={() => setCancellingId(registration.id)}
                          disabled={isCancelling && cancellingId === registration.id}
                        >
                          {isCancelling && cancellingId === registration.id ? (
                            <>
                              <Icon name="Loader2" className="h-4 w-4 mr-1 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <Icon name="XCircle" className="h-4 w-4 mr-1" />
                              Cancel Registration
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {allRegistrations.length > 0 && (
          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="outline" asChild className="bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                <Link to="/events">
                  <Icon name="Search" className="mr-2 h-4 w-4" />
                  Discover More Events
                </Link>
              </Button>
              <Button variant="outline" asChild className="bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-colors">
                <Link to="/profile">
                  <Icon name="User" className="mr-2 h-4 w-4" />
                  View Profile
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          open={cancellingId !== null}
          onOpenChange={() => setCancellingId(null)}
          title="Cancel Registration"
          description="Are you sure you want to cancel this registration? This action cannot be undone and you may lose your spot in the event."
          onConfirm={() => cancellingId && handleCancelRegistration(cancellingId)}
          loading={isCancelling}
          variant="destructive"
          confirmText="Cancel Registration"
        />
      </div>
    </div>
  )
}