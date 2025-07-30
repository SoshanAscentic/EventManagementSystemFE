//src/components/organisms/EventCard/EventCard.tsx
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, Icon } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRegistrationStatus } from '@/shared/hooks/useRegistrationStatus'
import { ConditionalRender } from '@/components/atoms'
import { EventDto } from '@/shared/types/domain'
import { formatEventDateTime, formatRelativeTime } from '@/shared/utils/formatters'
import { useState, useEffect } from 'react'
import { useCancelRegistrationMutation } from '@/features/registrations/api/registrationsApi'
import { useRegisterForEventMutation } from '@/features/registrations/api/registrationsApi'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

interface EventCardProps {
  event: EventDto
  showActions?: boolean
  onRegister?: (eventId: number) => void
  onDelete?: (eventId: number) => void
  variant?: 'default' | 'featured' | 'compact' | 'admin'
}

// Default fallback image
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'

// Function to construct full image URL from relative path
const constructImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return DEFAULT_EVENT_IMAGE
  }
  
  if (imageUrl.startsWith('https://eventmanagementsoshan123.blob.core.windows.net/eventmanagementblob/') || imageUrl.startsWith('http://eventmanagementsoshan123.blob.core.windows.net/eventmanagementblob/')) {
    return imageUrl
  }
  
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl
  }
  
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
  const azureBlobBaseUrl = 'https://eventmanagementsoshan123.blob.core.windows.net/eventmanagementblob/'
  
  return `${azureBlobBaseUrl}${cleanPath}`
}

const getEventImageUrl = (event: EventDto): string => {
  if (event.primaryImageUrl && event.primaryImageUrl.trim()) {
    const url = constructImageUrl(event.primaryImageUrl)
    return url
  }
  
  return DEFAULT_EVENT_IMAGE
}

export const EventCard = ({ event, showActions = true, onRegister, onDelete, variant = 'default' }: EventCardProps) => {
  const { hasPermission, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(() => getEventImageUrl(event))
  const [imageLoading, setImageLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Use the reliable registration status hook
  const { 
    isRegistered, 
    registration, 
    canCancel, 
    isLoading: registrationLoading 
  } = useRegistrationStatus(event.id)

  // Mutations for registration
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation()
  const [cancelRegistration, { isLoading: isCancelling }] = useCancelRegistrationMutation()

  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: { pathname: `/events/${event.id}` } }
      })
      return
    }

    if (onRegister) {
      onRegister(event.id)
      return
    }

    // Handle registration directly if no onRegister callback
    try {
      await registerForEvent({
        eventId: event.id,
        notes: undefined
      }).unwrap()
    } catch (error: any) {
      console.error('Registration failed:', error)
    }
  }

  const handleCancelRegistration = async () => {
    if (!registration) return
    
    try {
      await cancelRegistration({
        registrationId: registration.id,
        reason: 'User requested cancellation from event card'
      }).unwrap()
      setShowCancelDialog(false)
    } catch (error) {
      console.error('Failed to cancel registration:', error)
    }
  }

  // Initialize image URL
  useEffect(() => {
    const imageUrl = getEventImageUrl(event)
    setCurrentImageUrl(imageUrl)
    setImageLoading(true)
  }, [event.id, event.primaryImageUrl])

  const handleImageError = () => {
    if (currentImageUrl !== DEFAULT_EVENT_IMAGE) {
      setCurrentImageUrl(DEFAULT_EVENT_IMAGE)
      return
    }
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Debug remainingCapacity
  console.log(`EventCard Debug - Event ID: ${event.id}, Title: ${event.title}`)
  console.log(`Capacity: ${event.capacity}, Current: ${event.currentRegistrations}, Remaining: ${event.remainingCapacity}`)
  console.log(`Calculated remaining: ${event.capacity - event.currentRegistrations}`)
  console.log(`Remaining capacity type: ${typeof event.remainingCapacity}, value: ${event.remainingCapacity}`)

  // Compact variant for EventDetailPage related events
  if (variant === 'compact') {
    return (
      <div className="flex space-x-3 p-3 rounded-lg bg-gray-50/50 hover:bg-white transition-colors border border-gray-100 hover:border-blue-200 hover:shadow-sm">
        <div className="relative">
          <img
            src={currentImageUrl}
            alt={event.title}
            className="w-12 h-12 rounded-lg object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {isRegistered && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {event.title}
          </h4>
          <p className="text-xs text-gray-500">
            {new Date(event.startDateTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>

        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/events/${event.id}`}>
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  // Admin variant with debugging info
  if (variant === 'admin') {
    return (
      <Card className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden h-full">
        <div className="relative overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
              <Icon name="Loader2" className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          
          <img
            src={currentImageUrl}
            alt={event.title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status and ID Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="outline" className="bg-white/90 text-gray-700 shadow-md">
              ID: {event.id}
            </Badge>
          </div>

          {/* Registration Status for Admin */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            {isRegistered && (
              <Badge className="bg-blue-100 text-blue-800 text-xs shadow-md">
                <Icon name="User" className="w-3 h-3 mr-1" />
                You're Registered
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {event.categoryName}
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              {event.eventType}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-1">
            {event.description}
          </p>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Icon name="Calendar" className="h-4 w-4 mr-2 text-blue-500" />
              {formatEventDateTime(event.startDateTime, event.endDateTime)}
            </div>
            <div className="flex items-center text-gray-600">
              <Icon name="MapPin" className="h-4 w-4 mr-2 text-red-500" />
              {event.venue}
            </div>

            <div className="flex items-center text-gray-600">
              <Icon name="Clock" className="h-4 w-4 mr-2 text-orange-500" />
              Created {formatRelativeTime(event.createdAt)}
            </div>
          </div>



          {/* Admin Actions */}
          {showActions && (
            <div className="flex gap-2 mt-auto">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to={`/events/${event.id}`}>
                  <Icon name="Eye" className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
              
              <ConditionalRender condition={hasPermission('canEditEvents')}>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to={`/admin/events/${event.id}/edit`}>
                    <Icon name="Edit" className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
              </ConditionalRender>

              <ConditionalRender condition={Boolean(onDelete) && hasPermission('canDeleteEvents')}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  onClick={() => onDelete?.(event.id)}
                >
                  <Icon name="Trash2" className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </ConditionalRender>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default variant (public event cards)
  return (
    <Card className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden h-full">
      <div className="relative overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
            <Icon name="Loader2" className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        <img
          src={currentImageUrl}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        


        {/* Registration Status Badge */}
        {isRegistered && (
          <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 shadow-md">
            <Icon name="Check" className="w-3 h-3 mr-1" />
            Registered
          </Badge>
        )}
      </div>

      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            {event.categoryName}
          </Badge>
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            {event.eventType}
          </Badge>
        </div>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-1">
          {event.description}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <Icon name="Calendar" className="mr-2 h-4 w-4 text-blue-500" />
            {new Date(event.startDateTime).toLocaleDateString('en-US', {
              weekday: variant === 'featured' ? 'long' : 'short',
              year: 'numeric',
              month: variant === 'featured' ? 'long' : 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Icon name="MapPin" className="mr-2 h-4 w-4 text-red-500" />
            <span className="truncate">{event.venue}</span>
          </div>

        </div>



        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-3 mt-auto">
            <Button variant="outline" size="sm" className="flex-1 border-gray-200 hover:border-blue-300 hover:bg-blue-50" asChild>
              <Link to={`/events/${event.id}`}>
                <Icon name="Eye" className="w-4 h-4 mr-1" />
                View Details
              </Link>
            </Button>
            
            {/* Registration Status and Actions */}
            {registrationLoading ? (
              <div className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-50 border border-gray-200 rounded text-sm">
                <Icon name="Loader2" className="w-4 h-4 mr-1 animate-spin" />
                Loading...
              </div>
            ) : isRegistered ? (
              <div className="flex-1 flex gap-2">
                <div className="flex-1 flex items-center justify-center py-2 px-3 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">
                  <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
                  Registered
                </div>
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Icon name="Loader2" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon name="X" className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                disabled={event.remainingCapacity === 0 || isRegistering}
                onClick={handleRegisterClick}
              >
                {isRegistering ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-1 animate-spin" />
                    Registering...
                  </>
                ) : event.remainingCapacity === 0 ? (
                  <>
                    <Icon name="X" className="w-4 h-4 mr-1" />
                    Full
                  </>
                ) : (
                  <>
                    <Icon name="Calendar" className="w-4 h-4 mr-1" />
                    Register
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
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
    </Card>
  )
}