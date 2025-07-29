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
        new Date(reg.eventStartDateTime) > new Date() && reg.status === 'Active'
      )
    } else if (timeframeFilter === 'past') {
      filtered = filtered.filter(reg => 
        new Date(reg.eventStartDateTime) <= new Date()
      )
    }

    return filtered
  }, [allRegistrations, timeframeFilter])

  const handleCancelRegistration = async (registrationId: number) => {
    try {
      await cancelRegistration({ 
        registrationId, 
        reason: 'User requested cancellation' 
      }).unwrap()
      setCancellingId(null)
      refetch() // Refresh the data
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Event Registrations</h1>
          
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-6 mb-6">
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
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredRegistrations.length} of {allRegistrations.length} registrations
            </div>
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
            <CardContent className="py-12 text-center">
              <Icon name="Calendar" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {allRegistrations.length === 0 ? 'No registrations found' : 'No registrations match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {allRegistrations.length === 0 
                  ? "You haven't registered for any events yet."
                  : "Try adjusting your filters to see more registrations."
                }
              </p>
              {allRegistrations.length === 0 ? (
                <Button asChild>
                  <Link to="/events">
                    <Icon name="Search" className="mr-2 h-4 w-4" />
                    Browse Events
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={() => {
                  setStatusFilter('all')
                  setTimeframeFilter('all')
                }}>
                  <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map(registration => (
              <Card key={registration.id} className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {registration.eventTitle}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Icon name="Calendar" className="h-4 w-4 mr-2 text-blue-500" />
                          {formatEventDateTime(registration.eventStartDateTime, registration.eventEndDateTime)}
                        </div>
                        <div className="flex items-center">
                          <Icon name="MapPin" className="h-4 w-4 mr-2 text-red-500" />
                          {registration.venue}
                        </div>
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

                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            registration.status === 'Active' 
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
                            Attended
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/events/${registration.eventId}`}>
                          <Icon name="Eye" className="h-4 w-4 mr-1" />
                          View Event
                        </Link>
                      </Button>
                      
                      {registration.canCancel && registration.status === 'Active' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCancellingId(registration.id)}
                        >
                          <Icon name="X" className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          open={cancellingId !== null}
          onOpenChange={() => setCancellingId(null)}
          title="Cancel Registration"
          description="Are you sure you want to cancel this registration? This action cannot be undone."
          onConfirm={() => cancellingId && handleCancelRegistration(cancellingId)}
          loading={isCancelling}
          variant="destructive"
          confirmText="Cancel Registration"
        />
      </div>
    </div>
  )
}