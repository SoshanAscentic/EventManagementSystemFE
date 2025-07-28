import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Icon } from '@/components/atoms'
import { useMyRegistrations, useRegistrationActions } from '@/features/registrations/hooks'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Link } from 'react-router-dom'

export const MyRegistrationsPage = () => {
  const { registrations, isLoading, filters, updateFilter } = useMyRegistrations()
  const { handleCancel, isLoading: isCancelling } = useRegistrationActions()
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const handleCancelRegistration = async (registrationId: number) => {
    const result = await handleCancel(registrationId, 'User requested cancellation')
    if (result.success) {
      setCancellingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Registrations</h1>
        
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filters.timeframe}
            onChange={(e) => updateFilter('timeframe', e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
            <option value="all">All Events</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="Calendar" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
            <p className="text-gray-500 mb-6">You haven't registered for any events yet.</p>
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map(registration => (
            <Card key={registration.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {registration.eventTitle}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Icon name="Calendar" className="h-4 w-4 mr-2" />
                        {new Date(registration.eventStartDateTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Icon name="MapPin" className="h-4 w-4 mr-2" />
                        {registration.venue}
                      </div>
                      <div className="flex items-center">
                        <Icon name="Clock" className="h-4 w-4 mr-2" />
                        Registered on {new Date(registration.registeredAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Badge
                      className={registration.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {registration.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/events/${registration.eventId}`}>
                        View Event
                      </Link>
                    </Button>
                    
                    {registration.canCancel && registration.status === 'Active' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCancellingId(registration.id)}
                      >
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
      />
    </div>
  )
}