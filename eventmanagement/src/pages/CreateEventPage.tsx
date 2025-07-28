import { useNavigate } from 'react-router-dom'
import { EventForm } from '@/features/events/components/EventForm'
import { useCreateEventMutation } from '@/features/events/api/eventsApi'

export const CreateEventPage = () => {
  const navigate = useNavigate()
  const [createEvent, { isLoading }] = useCreateEventMutation()

  const handleSubmit = async (data: any) => {
    try {
      await createEvent(data).unwrap()
      navigate('/admin/events')
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <EventForm onSubmit={handleSubmit} loading={isLoading} />
    </div>
  )
}