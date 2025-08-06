import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge, Icon, Spinner } from '@/components/atoms'
import { EventCard } from '@/components/organisms'
import { useGetEventByIdQuery, useGetUpcomingEventsQuery } from '@/features/events/api/eventsApi'
import { useRegisterForEventMutation, useCancelRegistrationMutation } from '@/features/registrations/api/registrationsApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRegistrationStatus } from '@/shared/hooks/useRegistrationStatus'
import { formatEventDateTime, formatRelativeTime } from '@/shared/utils/formatters'
import { useState, useEffect } from 'react'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useEventSignalR } from '@/shared/hooks/useEventSignalR'

// Mock agenda data
const getMockAgenda = (startDateTime: string, endDateTime: string) => {
  const start = new Date(startDateTime)
  const end = new Date(endDateTime)
  
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
  
  if (duration <= 4) {
    return [
      { time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Registration & Welcome', speaker: 'Event Staff' },
      { time: new Date(start.getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Opening Session', speaker: 'Keynote Speaker' },
      { time: new Date(start.getTime() + 2 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Main Presentation', speaker: 'Featured Speaker' },
      { time: new Date(start.getTime() + 3 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Q&A Session', speaker: 'All Speakers' },
      { time: end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Closing & Networking', speaker: '' },
    ]
  } else {
    return [
      { time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Registration & Coffee', speaker: 'Event Staff' },
      { time: new Date(start.getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Opening Keynote', speaker: 'Keynote Speaker' },
      { time: new Date(start.getTime() + 2 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Workshop Session 1', speaker: 'Expert Panel' },
      { time: new Date(start.getTime() + 3 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Coffee Break', speaker: '' },
      { time: new Date(start.getTime() + 3.5 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Workshop Session 2', speaker: 'Industry Leaders' },
      { time: new Date(start.getTime() + 5 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Lunch Break', speaker: '' },
      { time: new Date(start.getTime() + 6 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Afternoon Sessions', speaker: 'Various Speakers' },
      { time: new Date(start.getTime() + 7.5 * 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Panel Discussion', speaker: 'All Speakers' },
      { time: end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), title: 'Networking Reception', speaker: '' },
    ]
  }
}

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [shareButtonText, setShareButtonText] = useState('Share')

  // Always show entrance animations for event details (each event is unique content)
  const [] = useState(true)

  const eventId = id ? parseInt(id) : 0

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  
  // Use the reliable registration status hook
  const { 
    isRegistered, 
    registration, 
    isLoading: registrationLoading 
  } = useRegistrationStatus(eventId)

  // Fetch the specific event
  const { 
    data: eventData, 
    isLoading: eventLoading, 
    error: eventError,
    refetch: refetchEvent
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  })

  // Fetch related events (from same category) - this hook was being called conditionally
  const { 
    data: relatedEventsData, 
    isLoading: relatedLoading 
  } = useGetUpcomingEventsQuery({
    categoryId: eventData?.data?.categoryId || 0, // Provide default value
    count: 3
  }, {
    skip: !eventData?.data?.categoryId, // Keep the skip condition
  })

  // Registration and cancellation mutations
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation()
  const [cancelRegistration, { isLoading: isCancelling }] = useCancelRegistrationMutation()

  // Derived values after all hooks
  const event = eventData?.data
  const relatedEvents = relatedEventsData?.data?.filter(e => e.id !== eventId) || []

  // Generate mock agenda based on event times
  const agenda = event ? getMockAgenda(event.startDateTime, event.endDateTime) : []

  // Add debug logging only here if needed
  useEffect(() => {
    if (event) {
      console.log(`EventDetail Debug - Event ID: ${event.id}, Title: ${event.title}`)
      console.log(`Capacity: ${event.capacity}, Current: ${event.currentRegistrations}, Remaining: ${event.remainingCapacity}`)
    }
  }, [event])

  // Add SignalR integration for this event
  useEventSignalR(eventId)

  // Helper function to conditionally add animation classes (always enabled for event details)
  const getAnimationClass = (baseClass: string) => {
    return baseClass // Always show animations for event details
  }

  // Helper function to get animation style (always enabled for event details)
  const getAnimationStyle = (delay: string) => {
    return { animationDelay: delay } // Always show animations for event details
  }

  // Share functionality
  const handleShare = async () => {
    if (!event) return

    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title} - ${new Date(event.startDateTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} at ${event.venue}`,
      url: window.location.href
    }

    try {
      // Try to use Web Share API first (available on mobile and some desktop browsers)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        return
      }
    } catch (error) {
      console.log('Web Share API failed, falling back to clipboard')
    }

    // Fallback to copying URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareButtonText('Link Copied!')
      
      // Reset button text after 2 seconds
      setTimeout(() => {
        setShareButtonText('Share')
      }, 2000)
    } catch (error) {
      // Final fallback for very old browsers
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setShareButtonText('Link Copied!')
        setTimeout(() => {
          setShareButtonText('Share')
        }, 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        setShareButtonText('Share Failed')
        setTimeout(() => {
          setShareButtonText('Share')
        }, 2000)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: { pathname: `/events/${eventId}` } }
      })
      return
    }

    if (!event || event.remainingCapacity === 0) return

    try {
      await registerForEvent({
        eventId: event.id,
        notes: undefined
      }).unwrap()
      
      // The cache will be invalidated automatically
      // Registration status will refresh with updated data
    } catch (error: any) {
      console.error('Registration failed:', error)
    }
  }

  const handleRelatedEventRegister = (relatedEventId: number) => {
    navigate(`/events/${relatedEventId}`)
  }

  const handleCancelRegistration = async () => {
    if (!registration) return
    
    try {
      await cancelRegistration({
        registrationId: registration.id,
        reason: 'User requested cancellation from event detail page'
      }).unwrap()
      setShowCancelDialog(false)
      // The cache will be invalidated automatically
    } catch (error) {
      console.error('Failed to cancel registration:', error)
    }
  }

  const constructImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
    
    // Use environment variables with fallback logic
    const useLocal = import.meta.env.VITE_USE_LOCAL_API === 'true'
    const productionUrl = import.meta.env.VITE_PRODUCTION_API_URL
    const localUrl = import.meta.env.VITE_LOCAL_API_URL

    const baseUrl = useLocal ? localUrl : productionUrl
    return `${baseUrl}/${cleanPath}`
  }

  // NOW HANDLE CONDITIONAL RENDERING AFTER ALL HOOKS
  
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
              The event you're looking for doesn't exist or may have been removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetchEvent()}>
                <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link to="/events">
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Browse Events
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
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-30"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className={`flex items-center space-x-2 text-sm text-gray-500 mb-8 ${getAnimationClass('animate-fade-in')}`}>
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Home</Link>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <Link to="/events" className="hover:text-blue-600 transition-colors font-medium">Events</Link>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <span className="text-gray-900 font-semibold">{event.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            <div className={`relative ${getAnimationClass('animate-fade-in')}`} style={getAnimationStyle('0.1s')}>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={constructImageUrl(event.primaryImageUrl)}
                  alt={event.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm shadow-lg border border-white/20">
                    {event.categoryName}
                  </Badge>
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-white/30 text-gray-700 shadow-lg">
                    {event.eventType}
                  </Badge>
                  {isRegistered && (
                    <Badge className="bg-blue-500/90 text-white backdrop-blur-sm shadow-lg border border-blue-400/30">
                      <Icon name="Check" className="mr-1 h-3 w-3" />
                      You're Registered
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center">
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">
                        {new Date(event.startDateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="MapPin" className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">{event.venue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Title and Description */}
            <div className={getAnimationClass('animate-fade-in')} style={getAnimationStyle('0.2s')}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className={getAnimationClass('animate-fade-in')} style={getAnimationStyle('0.3s')}>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-md border border-white/20">
                  <TabsTrigger 
                    value="details" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Event Details
                  </TabsTrigger>
                  <TabsTrigger 
                    value="agenda"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Agenda
                  </TabsTrigger>
                  <TabsTrigger 
                    value="location"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Location
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <Icon name="Info" className="mr-3 h-5 w-5 text-blue-600" />
                        Event Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              <Icon name="Users" className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Capacity & Registration</p>
                              <p className="text-gray-600">
                                {event.currentRegistrations} of {event.capacity} registered
                              </p>
                              <p className="text-gray-600">
                                {event.remainingCapacity} spots remaining
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                              <Icon name="Tag" className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Event Type</p>
                              <p className="text-gray-600">{event.eventType}</p>
                              <p className="text-gray-600">Category: {event.categoryName}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                              <Icon name="Clock" className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Schedule</p>
                              <p className="text-gray-600">
                                {formatEventDateTime(event.startDateTime, event.endDateTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                              <Icon name="MapPin" className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Venue</p>
                              <p className="text-gray-600">{event.venue}</p>
                              <p className="text-gray-600">{event.address}</p>
                              {event.city && event.country && (
                                <p className="text-gray-600">{event.city}, {event.country}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Registration Status */}
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <Icon name="CheckCircle" className="mr-2 h-5 w-5 text-green-600" />
                            Registration Status
                          </h4>
                          <Badge
                            variant={event.isRegistrationOpen ? 'default' : 'secondary'}
                            className={event.isRegistrationOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                          >
                            {event.isRegistrationOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                        {isRegistered && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-medium flex items-center">
                              <Icon name="CheckCircle" className="mr-2 h-4 w-4" />
                              You are registered for this event!
                            </p>
                            {registration && (
                              <p className="text-green-600 text-sm mt-1">
                                Registered on {new Date(registration.registeredAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="agenda">
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <Icon name="Clock" className="mr-3 h-5 w-5 text-blue-600" />
                        Event Agenda
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {agenda.map((item, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-white hover:to-blue-50/50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md">
                            <div className="flex-shrink-0 w-16 text-sm font-bold text-blue-600 pt-1">
                              {item.time}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                              {item.speaker && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Icon name="User" className="inline h-3 w-3 mr-1 text-blue-500" />
                                  {item.speaker}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location">
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <Icon name="MapPin" className="mr-3 h-5 w-5 text-red-600" />
                        Event Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">{event.venue}</h4>
                        <p className="text-gray-600 mb-4">{event.address}</p>
                        {event.city && event.country && (
                          <p className="text-gray-600 mb-4">{event.city}, {event.country}</p>
                        )}
                      </div>
                      
                      <div className="bg-gradient-to-br from-gray-100 to-blue-50 rounded-xl h-64 flex items-center justify-center border border-gray-200">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="MapPin" className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-gray-600 font-medium">Interactive map would be displayed here</p>
                          <p className="text-sm text-gray-500 mt-1">(Feature coming soon)</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                          <Icon name="Navigation" className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors"
                          onClick={handleShare}
                        >
                          <Icon name="Share" className="mr-2 h-4 w-4" />
                          {shareButtonText}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className={getAnimationClass('animate-fade-in')} style={getAnimationStyle('0.4s')}>
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 sticky top-8 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-center text-xl">
                    {isRegistered ? 'Registration Confirmed' : 'Register for Event'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">FREE</div>
                    <p className="text-sm text-gray-600">Registration required</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available spots:</span>
                      <span className={`font-semibold ${event.remainingCapacity > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                        {event.remainingCapacity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total capacity:</span>
                      <span className="font-semibold text-gray-900">{event.capacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Registered:</span>
                      <span className="font-semibold text-blue-600">{event.currentRegistrations}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        (event.currentRegistrations / event.capacity) > 0.8 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${Math.min((event.currentRegistrations / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>

                  {/* Registration Actions */}
                  {registrationLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Icon name="Loader2" className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Checking registration status...</span>
                    </div>
                  ) : isRegistered ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <Icon name="CheckCircle" className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-semibold">You're registered!</p>
                        <p className="text-green-600 text-sm mt-1">Event details have been sent to your email</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-white hover:bg-gray-50 border-gray-200" asChild>
                          <Link to="/registrations">
                            <Icon name="Calendar" className="mr-2 h-4 w-4" />
                            My Registrations
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex-1 bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-600"
                          onClick={() => setShowCancelDialog(true)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <Icon name="XCircle" className="mr-2 h-4 w-4" />
                              Cancel Registration
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-lg font-semibold" 
                      disabled={event.remainingCapacity === 0 || !event.isRegistrationOpen || isRegistering}
                      onClick={handleRegister}
                    >
                      {isRegistering ? (
                        <>
                          <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin text-white" />
                          Registering...
                        </>
                      ) : event.remainingCapacity === 0 ? (
                        <>
                          <Icon name="X" className="mr-2 h-5 w-5 text-white" />
                          Event Full
                        </>
                      ) : !event.isRegistrationOpen ? (
                        <>
                          <Icon name="Lock" className="mr-2 h-5 w-5 text-white" />
                          Registration Closed
                        </>
                      ) : !isAuthenticated ? (
                        'Sign In to Register'
                      ) : (
                        'Register Now'
                      )}
                    </Button>
                  )}

                  {/* Share Button Only */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors"
                    onClick={handleShare}
                  >
                    <Icon 
                      name={shareButtonText === 'Link Copied!' ? "Check" : "Share"} 
                      className="mr-2 h-4 w-4" 
                    />
                    {shareButtonText}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Info */}
            <div className={getAnimationClass('animate-fade-in')} style={getAnimationStyle('0.5s')}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Event ID:</span>
                      <p className="font-mono font-semibold text-blue-600">#{event.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium">{formatRelativeTime(event.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Updated:</span>
                      <p className="font-medium">{formatRelativeTime(event.updatedAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium">
                        {event.isRegistrationOpen ? 'Open' : 'Closed'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className={getAnimationClass('animate-fade-in')} style={getAnimationStyle('0.6s')}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">Related Events</CardTitle>
                    <p className="text-sm text-gray-600">More events in {event.categoryName}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedLoading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {relatedEvents.map((relatedEvent) => (
                          <EventCard 
                            key={relatedEvent.id}
                            event={relatedEvent}
                            variant="compact"
                            showActions={false}
                            onRegister={handleRelatedEventRegister}
                          />
                        ))}
                        <Link 
                          to={`/events?categoryId=${event.categoryId}`} 
                          className="block text-sm text-blue-600 hover:text-blue-800 font-medium text-center pt-2 border-t border-gray-100 transition-colors"
                        >
                          View all {event.categoryName} events →
                        </Link>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
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

      {/* Enhanced CSS animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { 
          animation: fade-in 0.4s ease-out forwards; 
          opacity: 0; 
        }
      `}</style>
    </div>
  )
}