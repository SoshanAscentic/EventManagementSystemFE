import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/atoms'
import { EventForm } from '@/features/events/components/EventForm'
import { useCreateEventMutation, useUploadEventImageMutation, useGetEventByIdQuery } from '@/features/events/api/eventsApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { Link } from 'react-router-dom'

export const CreateEventPage = () => {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [createEvent, { isLoading }] = useCreateEventMutation()
  const [uploadImage] = useUploadEventImageMutation()
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<number | null>(null)

  // Fetch the created event to get updated image URLs
  const { data: eventData, refetch: refetchEvent } = useGetEventByIdQuery(createdEventId!, {
    skip: !createdEventId,
  })

  // Check admin permissions
  useEffect(() => {
    if (!hasPermission('canCreateEvents')) {
      navigate('/unauthorized')
    }
  }, [hasPermission, navigate])

  const handleSubmit = async (data: any) => {
    console.log('=== CREATE EVENT PAGE SUBMIT ===')
    console.log('Received data:', data)
    
    try {
      console.log('Creating event with data:', data)
      
      // Extract image data before creating event
      const { useDefaultImage, newImages, ...eventData } = data
      console.log('Event data (without images):', eventData)
      console.log('Use default image:', useDefaultImage)
      console.log('New images:', newImages)
      
      // Create the event first
      const result = await createEvent(eventData).unwrap()
      console.log('Create event result:', result)
      
      if (result.success && result.data) {
        const createdEvent = result.data
        console.log('Event created successfully:', createdEvent)
        setCreatedEventId(createdEvent.id)
        
        // Upload images if any were selected and not using default
        if (!useDefaultImage && newImages && newImages.length > 0) {
          console.log('Uploading', newImages.length, 'images...')
          setIsUploadingImages(true)
          
          try {
            let primaryImageUploaded = false
            
            // Upload all images
            for (let i = 0; i < newImages.length; i++) {
              const image = newImages[i]
              if (image.file) {
                console.log(`Uploading image ${i + 1}/${newImages.length}:`, image.file.name)
                
                const isPrimary = (i === 0 && !primaryImageUploaded) || image.isPrimary
                if (isPrimary) primaryImageUploaded = true
                
                const uploadResult = await uploadImage({
                  eventId: createdEvent.id,
                  file: image.file,
                  isPrimary
                }).unwrap()
                
                console.log(`Image ${i + 1} upload result:`, uploadResult)
              }
            }
            
            console.log('All images uploaded successfully')
          } catch (imageError) {
            console.error('Image upload failed:', imageError)
            // Continue even if image upload fails
          } finally {
            setIsUploadingImages(false)
          }
        }
        
        // Navigate to the events list with success message
        console.log('Navigating to admin events page...')
        navigate('/admin/events', {
          state: { 
            message: `Event "${createdEvent.title}" created successfully!${
              !useDefaultImage && newImages?.length > 0 ? ` ${newImages.length} image(s) uploaded.` : ''
            }` 
          }
        })
      } else {
        console.error('Event creation failed - no success in result:', result)
      }
    } catch (error: any) {
      console.error('Failed to create event:', error)
      console.error('Error details:', error.message, error.stack)
      setIsUploadingImages(false)
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

        {/* Loading overlay for image upload */}
        {isUploadingImages && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center max-w-sm mx-4">
              <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-900 font-medium mb-2">Uploading images...</p>
              <p className="text-gray-600 text-sm">Please wait while we upload your event images. This may take a few moments.</p>
            </div>
          </div>
        )}

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
              loading={isLoading || isUploadingImages}
              isEdit={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}