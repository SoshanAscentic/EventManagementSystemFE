import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, Icon } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'
import { ConditionalRender } from '@/components/atoms'
import { EventDto } from '@/shared/types/domain'

interface EventCardProps {
  event: EventDto
  showActions?: boolean
  onRegister?: (eventId: number) => void
  variant?: 'default' | 'featured' | 'compact'
}

export const EventCard = ({ event, showActions = true, onRegister, variant = 'default' }: EventCardProps) => {
  const { hasPermission, isAuthenticated } = useAuth()

  // Featured variant for HomePage
  if (variant === 'featured') {
    return (
      <Card className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden h-full">
        <div className="relative overflow-hidden">
          <img
            src={event.primaryImageUrl}
            alt={event.title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {event.remainingCapacity === 0 ? (
              <Badge variant="destructive" className="shadow-md">
                <Icon name="X" className="w-3 h-3 mr-1" />
                Sold Out
              </Badge>
            ) : event.remainingCapacity <= 10 ? (
              <Badge className="bg-orange-500 hover:bg-orange-600 shadow-md">
                <Icon name="AlertTriangle" className="w-3 h-3 mr-1" />
                {event.remainingCapacity} left
              </Badge>
            ) : (
              <Badge className="bg-green-500 hover:bg-green-600 shadow-md">
                <Icon name="CheckCircle" className="w-3 h-3 mr-1" />
                {event.remainingCapacity} spots
              </Badge>
            )}
          </div>

          {event.isUserRegistered && (
            <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 shadow-md">
              <Icon name="Check" className="w-3 h-3 mr-1" />
              Registered
            </Badge>
          )}

          {/* Floating Action Button */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              className="rounded-full bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm shadow-lg"
              asChild
            >
              <Link to={`/events/${event.id}`}>
                <Icon name="Eye" className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          {/* Category & Type Badges */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {event.categoryName}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <Icon name="Calendar" className="mr-2 h-4 w-4 text-blue-500" />
              {new Date(event.startDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
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

          {showActions && (
            <div className="flex gap-3 mt-auto">
              <Button variant="outline" size="sm" className="flex-1 hover-lift" asChild>
                <Link to={`/events/${event.id}`}>View Details</Link>
              </Button>
              {event.isUserRegistered ? (
                <Badge variant="secondary" className="flex-1 justify-center py-2 bg-green-50 text-green-700 border-green-200">
                  <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
                  Registered
                </Badge>
              ) : (
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => onRegister?.(event.id)}>
                  Register Now
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Events page variant - matches original EventsPage styling
  if (variant === 'default') {
    return (
      <Card className="group bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden h-full">
        <div className="relative overflow-hidden">
          <img
            src={event.primaryImageUrl}
            alt={event.title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {event.remainingCapacity === 0 ? (
              <Badge variant="destructive" className="shadow-md">
                <Icon name="X" className="w-3 h-3 mr-1" />
                Sold Out
              </Badge>
            ) : event.remainingCapacity <= 10 ? (
              <Badge className="bg-orange-500 hover:bg-orange-600 shadow-md">
                <Icon name="AlertTriangle" className="w-3 h-3 mr-1" />
                {event.remainingCapacity} left
              </Badge>
            ) : (
              <Badge className="bg-green-500 hover:bg-green-600 shadow-md">
                <Icon name="CheckCircle" className="w-3 h-3 mr-1" />
                {event.remainingCapacity} spots
              </Badge>
            )}
          </div>

          {event.isUserRegistered && (
            <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 shadow-md">
              <Icon name="Check" className="w-3 h-3 mr-1" />
              Registered
            </Badge>
          )}

          {/* Floating Action Button */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              className="rounded-full bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm shadow-lg"
              asChild
            >
              <Link to={`/events/${event.id}`}>
                <Icon name="Eye" className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        <CardContent className="p-6 flex flex-col flex-1">
          {/* Category & Type Badges */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {event.categoryName}
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              {event.eventType}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-1">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <Icon name="Calendar" className="mr-2 h-4 w-4 text-blue-500" />
              {new Date(event.startDateTime).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Icon name="MapPin" className="mr-2 h-4 w-4 text-red-500" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Icon name="Users" className="mr-2 h-4 w-4 text-green-500" />
              {event.currentRegistrations}/{event.capacity} registered
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(event.currentRegistrations / event.capacity) * 100}%` }}
            ></div>
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
              {event.isUserRegistered ? (
                <Badge variant="secondary" className="flex-1 justify-center py-2 bg-green-50 text-green-700 border-green-200">
                  <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
                  Registered
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={event.remainingCapacity === 0}
                  onClick={() => onRegister?.(event.id)}
                >
                  {event.remainingCapacity === 0 ? (
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

          {/* Admin Actions - Only for admins */}
          <ConditionalRender condition={hasPermission('canEditEvents') || hasPermission('canDeleteEvents')}>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <ConditionalRender condition={hasPermission('canEditEvents')}>
                <Button variant="secondary" size="sm" asChild>
                  <Link to={`/admin/events/${event.id}/edit`}>Edit</Link>
                </Button>
              </ConditionalRender>
              
              <ConditionalRender condition={hasPermission('canDeleteEvents')}>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </ConditionalRender>
            </div>
          </ConditionalRender>
        </CardContent>
      </Card>
    )
  }

  // Compact variant for EventDetailPage related events
  if (variant === 'compact') {
    return (
      <div className="flex space-x-3 p-3 rounded-lg bg-gray-50/50 hover:bg-white transition-colors border border-gray-100 hover:border-blue-200 hover:shadow-sm">
        <img
          src={event.primaryImageUrl}
          alt={event.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
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
          <p className="text-xs text-green-600 font-medium">
            {event.remainingCapacity} spots left
          </p>
        </div>
      </div>
    )
  }

  return null
}