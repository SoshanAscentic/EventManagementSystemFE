import { useParams, useNavigate } from 'react-router-dom'
import { useGetEventByIdQuery } from '@/features/events/api/eventsApi'
import { RegistrationFlow } from '@/features/registrations/components/RegistrationFlow'
import { useEventRegistration } from '@/features/events/hooks'
import { useCancelRegistrationMutation, useGetMyRegistrationsQuery } from '@/features/registrations/api/registrationsApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/atoms'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useState } from 'react'

export const EventRegistrationPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const eventId = Number(id)
  
  const { data: eventData, isLoading, refetch: refetchEvent } = useGetEventByIdQuery(eventId)
  const { register, isLoading: isRegistering } = useEventRegistration(eventId)
  const [cancelRegistration, { isLoading: isCancelling }] = useCancelRegistrationMutation()

  // Get user's registrations to check if already registered
  const { data: registrationsData } = useGetMyRegistrationsQuery({
    pageNumber: 1,
    pageSize: 100,
    ascending: false,
  }, {
    skip: !isAuthenticated || !eventData?.data?.isUserRegistered,
  })

  // Find the user's registration for this event
  const userRegistration = registrationsData?.data?.items?.find(
    reg => reg.eventId === eventId && reg.status === 'Registered'
  )

  const handleRegistrationComplete = async (data: any) => {
    try {
      await register(data)
      navigate(`/events/${eventId}`, { 
        state: { message: 'Registration successful!' }
      })
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const handleCancelRegistration = async () => {
    if (!userRegistration) return
    
    try {
      await cancelRegistration({
        registrationId: userRegistration.id,
        reason: 'User requested cancellation'
      }).unwrap()
      setShowCancelDialog(false)
      refetchEvent() // Refresh event data
      navigate(`/events/${eventId}`, { 
        state: { message: 'Registration cancelled successfully!' }
      })
    } catch (error) {
      console.error('Failed to cancel registration:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!eventData?.data) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Event not found</h1>
      </div>
    )
  }

  const event = eventData.data

  // If user is already registered, show registration status instead of registration form
  if (event.isUserRegistered) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600 flex items-center justify-center">
                <Icon name="CheckCircle" className="mr-2 h-8 w-8" />
                Already Registered
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                <p className="text-gray-600">
                  You are already registered for this event. Event details have been sent to your email.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Icon name="Info" className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-green-800 font-medium">Registration Confirmed</p>
                    <p className="text-green-600 text-sm">
                      Registered on {userRegistration ? new Date(userRegistration.registeredAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/events/${eventId}`)}
                >
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Back to Event Details
                </Button>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/registrations')}
                  >
                    <Icon name="Calendar" className="mr-2 h-4 w-4" />
                    My Registrations
                  </Button>

                  {userRegistration?.canCancel && (
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-red-50 border-red-200 hover:border-red-300 text-red-600"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={isCancelling}
                    >
                      <Icon name="X" className="mr-2 h-4 w-4" />
                      Cancel Registration
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cancel Registration Dialog */}
        <ConfirmDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          title="Cancel Registration"
          description="Are you sure you want to cancel your registration for this event? This action cannot be undone."
          onConfirm={handleCancelRegistration}
          loading={isCancelling}
          variant="destructive"
          confirmText="Cancel Registration"
        />
      </div>
    )
  }

  // Show registration form if not registered
  return (
    <div className="container mx-auto py-8">
      <RegistrationFlow
        event={eventData.data}
        onComplete={handleRegistrationComplete}
        loading={isRegistering}
      />
    </div>
  )
}