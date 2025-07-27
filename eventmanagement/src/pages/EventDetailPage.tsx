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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-30"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Home</Link>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <Link to="/events" className="hover:text-blue-600 transition-colors font-medium">Events</Link>
          <Icon name="ChevronRight" className="h-4 w-4" />
          <span className="text-gray-900 font-semibold">{mockEvent.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            <div className="relative animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={mockEvent.primaryImageUrl}
                  alt={mockEvent.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm shadow-lg border border-white/20">
                    {mockEvent.category}
                  </Badge>
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-white/30 text-gray-700 shadow-lg">
                    {mockEvent.eventType}
                  </Badge>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                    {mockEvent.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center">
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">
                        {new Date(mockEvent.startDateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="MapPin" className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">{mockEvent.venue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Title and Description */}
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{mockEvent.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
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
                        About This Event
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              <Icon name="Calendar" className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Date & Time</p>
                              <p className="text-gray-600 mb-1">
                                {new Date(mockEvent.startDateTime).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-gray-600">
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
                          
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                              <Icon name="MapPin" className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Location</p>
                              <p className="text-gray-600">{mockEvent.venue}</p>
                              <p className="text-gray-600 text-sm">{mockEvent.address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                              <Icon name="Users" className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Attendees</p>
                              <p className="text-gray-600">
                                {mockEvent.currentRegistrations} registered
                              </p>
                              <p className="text-gray-600">
                                {mockEvent.remainingCapacity} spots remaining
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                              <Icon name="Tag" className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Category</p>
                              <p className="text-gray-600">{mockEvent.category}</p>
                              <p className="text-gray-600">{mockEvent.eventType}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Organizer Section */}
                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Icon name="User" className="mr-2 h-5 w-5 text-blue-600" />
                          Event Organizer
                        </h4>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                            <AvatarImage src={mockEvent.organizer.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              TE
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{mockEvent.organizer.name}</p>
                            <p className="text-gray-600">{mockEvent.organizer.email}</p>
                          </div>
                        </div>
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
                        {mockEvent.agenda.map((item, index) => (
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
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">{mockEvent.venue}</h4>
                        <p className="text-gray-600 mb-4">{mockEvent.address}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-gray-100 to-blue-50 rounded-xl h-64 flex items-center justify-center border border-gray-200">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="MapPin" className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-gray-600 font-medium">Interactive map would be displayed here</p>
                          <p className="text-sm text-gray-500 mt-1">(Phase 2 feature)</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                          <Icon name="Navigation" className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                        <Button variant="outline" className="flex-1 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                          <Icon name="Share" className="mr-2 h-4 w-4" />
                          Share Location
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
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 sticky top-8 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-center text-xl">Register for Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">FREE</div>
                    <p className="text-sm text-gray-600">Registration required</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available spots:</span>
                      <span className="font-semibold text-green-600">{mockEvent.remainingCapacity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total capacity:</span>
                      <span className="font-semibold text-gray-900">{mockEvent.capacity}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${(mockEvent.currentRegistrations / mockEvent.capacity) * 100}%` }}
                    ></div>
                  </div>

                  {mockEvent.isUserRegistered ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <Icon name="CheckCircle" className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-semibold">You're registered!</p>
                      </div>
                      <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-200">
                        <Icon name="Calendar" className="mr-2 h-4 w-4" />
                        Add to Calendar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-lg font-semibold" 
                      disabled={mockEvent.remainingCapacity === 0}
                    >
                      {mockEvent.remainingCapacity === 0 ? (
                        <>
                          <Icon name="X" className="mr-2 h-5 w-5" />
                          Event Full
                        </>
                      ) : (
                        'Register Now'
                      )}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 transition-colors">
                      <Icon name="Heart" className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors">
                      <Icon name="Share" className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Info */}
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Event ID:</span>
                      <p className="font-mono font-semibold text-blue-600">#{mockEvent.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium">2 weeks ago</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Updated:</span>
                      <p className="font-medium">3 days ago</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <p className="font-medium">English</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Events */}
            <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Related Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex space-x-3 p-3 rounded-lg bg-gray-50/50 hover:bg-white transition-colors border border-gray-100 hover:border-blue-200 hover:shadow-sm">
                      <img
                        src={`https://images.unsplash.com/photo-154057546706${i}-178a50c2df87?w=60&h=60&fit=crop`}
                        alt={`Related event ${i}`}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          Tech Workshop {i + 1}
                        </h4>
                        <p className="text-xs text-gray-500">Nov {15 + i}, 2024</p>
                        <p className="text-xs text-green-600 font-medium">25 spots left</p>
                      </div>
                    </div>
                  ))}
                  <Link to="/events" className="block text-sm text-blue-600 hover:text-blue-800 font-medium text-center pt-2 border-t border-gray-100 transition-colors">
                    View all related events →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}