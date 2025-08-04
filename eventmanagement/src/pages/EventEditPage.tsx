import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon, Spinner } from '@/components/atoms'
import { EventForm } from '@/features/events/components/EventForm'
import { useGetEventByIdQuery, useUpdateEventMutation } from '@/features/events/api/eventsApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { Link } from 'react-router-dom'

export const EventEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const eventId = id ? parseInt(id) : 0

  // Check admin permissions
  useEffect(() => {
    if (!hasPermission('canEditEvents')) {
      navigate('/unauthorized')
    }
  }, [hasPermission, navigate])

  const { 
    data: eventData, 
    isLoading: eventLoading, 
    error: eventError,
    // Remove refetch since it's causing the error
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  })

  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()

  const event = eventData?.data

  const handleSubmit = async (data: any) => {
    try {
      // Extract image data (images are managed separately in edit mode)
      const { useDefaultImage, newImages, ...eventData } = data
      
      await updateEvent({ 
        id: eventId, 
        ...eventData 
      }).unwrap()
      
      // Don't refetch here - just navigate with success message
      navigate('/admin/events', {
        state: { message: `Event "${eventData.title}" updated successfully!` }
      })
    } catch (error: any) {
      console.error('Failed to update event:', error)
    }
  }

  // Loading state
  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Icon name="AlertCircle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
            <p className="text-gray-600 mb-6">
              The event you're trying to edit doesn't exist or may have been removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link to="/admin/events">
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Back to Events
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
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
          <span className="text-gray-900 font-semibold">Edit Event</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
              <p className="text-gray-600">Make changes to "{event.title}"</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to={`/events/${eventId}`}>
                  <Icon name="Eye" className="mr-2 h-4 w-4" />
                  View Event
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/events">
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Back to Events
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Current Event Images Info */}
        {event.images && event.images.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Icon name="Image" className="mr-2 h-5 w-5 text-purple-600" />
                Current Event Images ({event.images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.images.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url}
                      alt="Event image"
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    {image.isPrimary && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Use the image management step in the form below to add, remove, or change the primary image.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Event Form */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Icon name="Edit" className="mr-3 h-5 w-5 text-blue-600" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm 
              event={event} 
              onSubmit={handleSubmit} 
              loading={isUpdating}
              isEdit={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}