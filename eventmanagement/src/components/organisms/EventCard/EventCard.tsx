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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface EventCardProps {
  event: EventDto
  showActions?: boolean
  onRegister?: (eventId: number) => void
  onDelete?: (eventId: number) => void
  variant?: 'default' | 'featured' | 'compact' | 'admin'
  disableEdit?: boolean
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

export const EventCard = ({ event, showActions = true, onDelete, variant = 'default', disableEdit = false }: EventCardProps) => {
  const { hasPermission, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(() => getEventImageUrl(event))
  const [imageLoading, setImageLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)

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

  // Helper function to check if event is completed
  const isEventCompleted = () => {
    const now = new Date()
    const endDate = new Date(event.endDateTime)
    return endDate < now
  }

  const completed = isEventCompleted()

  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: { pathname: `/events/${event.id}` } }
      })
      return
    }

    // Always show the confirmation dialog for registration
    // (HomePage and EventsPage pass placeholder onRegister functions that we should ignore)
    setShowRegisterDialog(true)
  }

  const handleConfirmRegister = async () => {
    if (!event || event.remainingCapacity === 0) return

    try {
      await registerForEvent({
        eventId: event.id,
        notes: undefined
      }).unwrap()
      
      setShowRegisterDialog(false)
      // The registration status will refresh automatically due to cache invalidation
    } catch (error: any) {
      console.error('Registration failed:', error)
      // Could add error handling/toast notification here
    }
  }

  const handleViewDetails = () => {
    setShowRegisterDialog(false)
    navigate(`/events/${event.id}`)
  }

  const handleCloseRegisterDialog = () => {
    setShowRegisterDialog(false)
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

  // Compact variant for EventDetailPage related events
  if (variant === 'compact') {
    return (
      <div className="group relative flex items-center space-x-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Completed Event Overlay for Compact */}
        {completed && (
          <div className="absolute inset-0 bg-gray-900/60 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg">
              <Icon name="Clock" className="w-4 h-4 mr-2 inline" />
              Completed
            </div>
          </div>
        )}
        
        <div className="relative flex-shrink-0">
          <div className="relative overflow-hidden rounded-lg shadow-sm">
            <img
              src={currentImageUrl}
              alt={event.title}
              className="w-16 h-16 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
          {isRegistered && !completed && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
            {event.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(event.startDateTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          {completed && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs mt-2">
              Completed
            </Badge>
          )}
        </div>
        
        <Button variant="ghost" size="sm" asChild className="flex-shrink-0 hover:bg-gray-50 rounded-lg transition-colors duration-200">
          <Link to={`/events/${event.id}`}>
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  // Admin variant
  if (variant === 'admin') {
    return (
      <Card className="group relative bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-gray-200 overflow-hidden h-full">
        {/* Completed Event Overlay for Admin */}
        {completed && (
          <div className="absolute inset-0 bg-gray-900/60 z-20 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg">
              <Icon name="Clock" className="w-5 h-5 mr-2 inline" />
              Event Completed
            </div>
          </div>
        )}

        <div className="relative overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <Icon name="Loader2" className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          
          <img
            src={currentImageUrl}
            alt={event.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
          
          {!completed && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
          
          {/* Status Badges */}
          {!completed && (
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <Badge variant="outline" className="bg-white/95 text-gray-700 shadow-sm border-gray-200">
                ID: {event.id}
              </Badge>
            </div>
          )}

          {/* Registration Status */}
          {!completed && isRegistered && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-green-500 text-white shadow-sm">
                <Icon name="Check" className="w-3 h-3 mr-1" />
                Registered
              </Badge>
            </div>
          )}
        </div>

        {/* Content Layout */}
        {completed ? (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-white border-t border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
              {event.title}
            </h3>
            
            {showActions && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to={`/events/${event.id}`}>
                    <Icon name="Eye" className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
                
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
          </div>
        ) : (
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {event.categoryName}
              </Badge>
              <Badge variant="outline" className="border-gray-200 text-gray-600">
                {event.eventType}
              </Badge>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {event.title}
            </h3>

            <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-1">
              {event.description}
            </p>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <Icon name="Calendar" className="h-4 w-4 text-blue-500" />
                </div>
                <span>{formatEventDateTime(event.startDateTime, event.endDateTime)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                  <Icon name="MapPin" className="h-4 w-4 text-red-500" />
                </div>
                <span className="truncate">{event.venue}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3">
                  <Icon name="Clock" className="h-4 w-4 text-gray-500" />
                </div>
                <span>Created {formatRelativeTime(event.createdAt)}</span>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`flex-1 transition-colors ${
                      disableEdit 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                    }`}
                    disabled={disableEdit}
                    asChild={!disableEdit}
                    title={disableEdit ? 'Edit disabled' : 'Edit event'}
                  >
                    {disableEdit ? (
                      <span>
                        <Icon name="Edit" className="h-4 w-4 mr-1" />
                        Edit
                      </span>
                    ) : (
                      <Link to={`/admin/events/${event.id}/edit`}>
                        <Icon name="Edit" className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    )}
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
        )}
      </Card>
    )
  }

  // Default variant (public event cards)
  return (
    <Card className="group relative bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-gray-200 overflow-hidden h-full">
      {/* Completed Event Overlay */}
      {completed && (
        <div className="absolute inset-0 bg-gray-900/60 z-20 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg">
            <Icon name="Clock" className="w-5 h-5 mr-2 inline" />
            Event Completed
          </div>
        </div>
      )}

      <div className="relative overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <Icon name="Loader2" className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        <img
          src={currentImageUrl}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
        
        {!completed && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        {/* Status Badges */}
        {!completed && isRegistered && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-green-500 hover:bg-green-600 shadow-md">
              <Icon name="Check" className="w-3 h-3 mr-1" />
              Registered
            </Badge>
          </div>
        )}
      </div>

      {/* Content Layout */}
      {completed ? (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-white border-t border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
            {event.title}
          </h3>
          
          {showActions && (
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to={`/events/${event.id}`}>
                  <Icon name="Eye" className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {event.categoryName}
            </Badge>
            <Badge variant="outline" className="border-gray-200 text-gray-600">
              {event.eventType}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {event.title}
          </h3>

          <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed flex-1">
            {event.description}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <Icon name="Calendar" className="h-4 w-4 text-blue-500" />
              </div>
              <span>
                {new Date(event.startDateTime).toLocaleDateString('en-US', {
                  weekday: variant === 'featured' ? 'long' : 'short',
                  year: 'numeric',
                  month: variant === 'featured' ? 'long' : 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                <Icon name="MapPin" className="h-4 w-4 text-red-500" />
              </div>
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3 mt-auto">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to={`/events/${event.id}`}>
                  <Icon name="Eye" className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
              
              {/* Registration Status and Actions */}
              {registrationLoading ? (
                <div className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  <Icon name="Loader2" className="w-4 h-4 mr-1 animate-spin" />
                  Loading...
                </div>
              ) : isRegistered ? (
                <div className="flex-1 flex gap-2">
                  <div className="flex-1 flex items-center justify-center py-2 px-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium">
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
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
      )}
      
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

      {/* Custom Register Confirmation Dialog */}
      <AlertDialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Icon name="Calendar" className="w-5 h-5 mr-2 text-blue-600" />
              Register for Event
            </AlertDialogTitle>
            <AlertDialogDescription>
              You're about to register for <strong>"{event.title}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Event details outside of AlertDialogDescription to avoid nesting issues */}
          <div className="px-6 py-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Icon name="Calendar" className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                <span>
                  {new Date(event.startDateTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Icon name="MapPin" className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Icon name="Users" className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                <span>{event.remainingCapacity} spots remaining</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Would you like to continue with registration or view the full event details first?
            </p>
          </div>

          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel 
              onClick={handleCloseRegisterDialog}
              disabled={isRegistering}
              className="w-full sm:w-auto"
            >
              <Icon name="X" className="w-4 h-4 mr-1" />
              Close
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="outline"
                onClick={handleViewDetails}
                disabled={isRegistering}
                className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                <Icon name="Eye" className="w-4 h-4 mr-1" />
                View Details First
              </Button>
            </AlertDialogAction>
            <Button
              onClick={handleConfirmRegister}
              disabled={isRegistering}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isRegistering ? (
                <>
                  <Icon name="Loader2" className="w-4 h-4 mr-1 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Icon name="UserPlus" className="w-4 h-4 mr-1" />
                  Continue to Register
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}