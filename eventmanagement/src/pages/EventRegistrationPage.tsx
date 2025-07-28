import { useParams, useNavigate } from 'react-router-dom'
import { useGetEventByIdQuery } from '@/features/events/api/eventsApi'
import { RegistrationFlow } from '@/features/registrations/components/RegistrationFlow'
import { useEventRegistration } from '@/features/events/hooks'

export const EventRegistrationPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const eventId = Number(id)
  
  const { data: eventData, isLoading } = useGetEventByIdQuery(eventId)
  const { register, isLoading: isRegistering } = useEventRegistration(eventId)

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