import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage, Badge, Icon } from '@/components/atoms'

const mockEvent = {
  id: 1,
  title: 'React Conference 2024',
  description: 'Join us for the biggest React conference of the year featuring industry experts, workshops, and networking opportunities. Learn about the latest React features, best practices, and future roadmap from the core team and community leaders.',
  startDateTime: '2024-10-15T09:00:00',
  endDateTime: '2024-10-15T17:00:00',
  venue: 'Tech Conference Center',
  address: '123 Tech Street, San Francisco, CA 94105',
  category: 'Technology',
  eventType: 'Conference',
  capacity: 500,
  currentRegistrations: 450,
  remainingCapacity: 50,
  primaryImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  isRegistrationOpen: true,
  isUserRegistered: false,
  organizer: {
    name: 'Tech Events Inc.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    email: 'contact@techevents.com'
  },
  agenda: [
    { time: '09:00', title: 'Registration & Coffee', speaker: 'Event Staff' },
    { time: '09:30', title: 'Opening Keynote: Future of React', speaker: 'Dan Abramov' },
    { time: '10:30', title: 'React Server Components Deep Dive', speaker: 'Sebastian Markbåge' },
    { time: '11:30', title: 'Coffee Break', speaker: '' },
    { time: '12:00', title: 'Building Accessible React Apps', speaker: 'Marcy Sutton' },
    { time: '13:00', title: 'Lunch', speaker: '' },
    { time: '14:00', title: 'State Management in 2024', speaker: 'Mark Erikson' },
    { time: '15:00', title: 'React Performance Optimization', speaker: 'Brian Vaughn' },
    { time: '16:00', title: 'Panel Discussion & Q&A', speaker: 'All Speakers' },
    { time: '17:00', title: 'Networking Reception', speaker: '' },
  ]
}

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <Icon name="ChevronRight" className="h-4 w-4" />
        <Link to="/events" className="hover:text-primary">Events</Link>
        <Icon name="ChevronRight" className="h-4 w-4" />
        <span className="text-gray-900">{mockEvent.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          <div className="relative">
            <img
              src={mockEvent.primaryImageUrl}
              alt={mockEvent.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge>{mockEvent.category}</Badge>
              <Badge variant="outline">{mockEvent.eventType}</Badge>
            </div>
          </div>

          {/* Event Title and Description */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{mockEvent.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{mockEvent.description}</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Icon name="Calendar" className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Date & Time</p>
                        <p className="text-sm text-gray-600">
                          {new Date(mockEvent.startDateTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(mockEvent.startDateTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(mockEvent.endDateTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Icon name="MapPin" className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-gray-600">{mockEvent.venue}</p>
                        <p className="text-sm text-gray-600">{mockEvent.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Icon name="Users" className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Attendees</p>
                        <p className="text-sm text-gray-600">
                          {mockEvent.currentRegistrations} registered
                        </p>
                        <p className="text-sm text-gray-600">
                          {mockEvent.remainingCapacity} spots remaining
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Icon name="Tag" className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Category</p>
                        <p className="text-sm text-gray-600">{mockEvent.category}</p>
                        <p className="text-sm text-gray-600">{mockEvent.eventType}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mockEvent.organizer.avatar} />
                      <AvatarFallback>TE</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mockEvent.organizer.name}</p>
                      <p className="text-sm text-gray-600">{mockEvent.organizer.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agenda">
              <Card>
                <CardHeader>
                  <CardTitle>Event Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEvent.agenda.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                        <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-500">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          {item.speaker && (
                            <p className="text-sm text-gray-600 mt-1">
                              <Icon name="User" className="inline h-3 w-3 mr-1" />
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
              <Card>
                <CardHeader>
                  <CardTitle>Event Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{mockEvent.venue}</h4>
                    <p className="text-gray-600 mb-4">{mockEvent.address}</p>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="MapPin" className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Interactive map would be displayed here</p>
                      <p className="text-sm text-gray-400">(Phase 2 feature)</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Icon name="Navigation" className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Icon name="Share" className="mr-2 h-4 w-4" />
                      Share Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Register for Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">FREE</div>
                <p className="text-sm text-gray-600">Registration required</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available spots:</span>
                  <span className="font-medium">{mockEvent.remainingCapacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total capacity:</span>
                  <span className="font-medium">{mockEvent.capacity}</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(mockEvent.currentRegistrations / mockEvent.capacity) * 100}%` }}
                ></div>
              </div>

              {mockEvent.isUserRegistered ? (
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    <Icon name="CheckCircle" className="mr-2 h-4 w-4" />
                    You're registered!
                  </Badge>
                  <Button variant="outline" className="w-full">
                    <Icon name="Calendar" className="mr-2 h-4 w-4" />
                    Add to Calendar
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  disabled={mockEvent.remainingCapacity === 0}
                  size="lg"
                >
                  {mockEvent.remainingCapacity === 0 ? 'Event Full' : 'Register Now'}
                </Button>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Icon name="Heart" className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Icon name="Share" className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Event ID:</span>
                <span className="font-mono">#{mockEvent.id.toString().padStart(6, '0')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span>2 weeks ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Updated:</span>
                <span>3 days ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Language:</span>
                <span>English</span>
              </div>
            </CardContent>
          </Card>

          {/* Related Events */}
          <Card>
            <CardHeader>
              <CardTitle>Related Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex space-x-3">
                  <img
                    src={`https://images.unsplash.com/photo-154057546706${i}-178a50c2df87?w=60&h=60&fit=crop`}
                    alt={`Related event ${i}`}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      Tech Workshop {i + 1}
                    </h4>
                    <p className="text-xs text-gray-500">Nov {15 + i}, 2024</p>
                    <p className="text-xs text-gray-500">25 spots left</p>
                  </div>
                </div>
              ))}
              <Link to="/events" className="text-sm text-primary hover:underline">
                View all related events →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}