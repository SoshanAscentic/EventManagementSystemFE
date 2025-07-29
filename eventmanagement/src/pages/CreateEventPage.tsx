import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/atoms'
import { EventForm } from '@/features/events/components/EventForm'
import { useCreateEventMutation } from '@/features/events/api/eventsApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { Link } from 'react-router-dom'

export const CreateEventPage = () => {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [createEvent, { isLoading }] = useCreateEventMutation()

  // Check admin permissions
  useEffect(() => {
    if (!hasPermission('canCreateEvents')) {
      navigate('/unauthorized')
    }
  }, [hasPermission, navigate])

  const handleSubmit = async (data: any) => {
    try {
      const result = await createEvent(data).unwrap()
      
      if (result.success) {
        navigate('/admin/events', {
          state: { message: 'Event created successfully!' }
        })
      }
    } catch (error: any) {
      console.error('Failed to create event:', error)
      // You could add a toast notification here
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/admin" className="hover:text-blue-600 transition-colors font-medium">Admin</Link>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <Link to="/admin/events" className="hover:text-blue-600 transition-colors font-medium">Events</Link>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <span className="text-gray-900 font-semibold">Create Event</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
              <p className="text-gray-600">Fill out the details below to create a new event</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/admin/events">
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>

        {/* Event Form */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Icon name="Plus" className="mr-3 h-5 w-5 text-blue-600" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm 
              onSubmit={handleSubmit} 
              loading={isLoading}
              isEdit={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}