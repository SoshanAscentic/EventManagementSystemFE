import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchBox } from '@/components/molecules'
import { Icon, Badge } from '@/components/atoms'

// Mock data for Phase 1
const mockEvents = [
  {
    id: 1,
    title: 'React Conference 2024',
    description: 'The biggest React conference of the year with industry experts',
    startDateTime: '2024-10-15T09:00:00',
    endDateTime: '2024-10-15T17:00:00',
    venue: 'Tech Center',
    address: '123 Tech Street, San Francisco, CA',
    category: 'Technology',
    eventType: 'Conference',
    capacity: 500,
    currentRegistrations: 450,
    remainingCapacity: 50,
    primaryImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
    isRegistrationOpen: true,
    isUserRegistered: false,
  },
  {
    id: 2,
    title: 'Digital Marketing Masterclass',
    description: 'Learn advanced digital marketing strategies from industry leaders',
    startDateTime: '2024-10-20T14:00:00',
    endDateTime: '2024-10-20T18:00:00',
    venue: 'Business Hub',
    address: '456 Business Ave, New York, NY',
    category: 'Business',
    eventType: 'Workshop',
    capacity: 100,
    currentRegistrations: 75,
    remainingCapacity: 25,
    primaryImageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop',
    isRegistrationOpen: true,
    isUserRegistered: false,
  },
  {
    id: 3,
    title: 'Contemporary Art Exhibition',
    description: 'Explore the latest in contemporary art from emerging artists',
    startDateTime: '2024-10-25T18:00:00',
    endDateTime: '2024-10-25T21:00:00',
    venue: 'Modern Gallery',
    address: '789 Art District, Los Angeles, CA',
    category: 'Arts',
    eventType: 'Exhibition',
    capacity: 200,
    currentRegistrations: 100,
    remainingCapacity: 100,
    primaryImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    isRegistrationOpen: true,
    isUserRegistered: true,
  },
  {
    id: 4,
    title: 'AI & Machine Learning Summit',
    description: 'Deep dive into the future of artificial intelligence and machine learning',
    startDateTime: '2024-11-05T09:30:00',
    endDateTime: '2024-11-05T16:00:00',
    venue: 'Innovation Center',
    address: '321 Innovation Blvd, Seattle, WA',
    category: 'Technology',
    eventType: 'Conference',
    capacity: 300,
    currentRegistrations: 180,
    remainingCapacity: 120,
    primaryImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
    isRegistrationOpen: true,
    isUserRegistered: false,
  },
  {
    id: 5,
    title: 'Wellness & Mindfulness Workshop',
    description: 'Learn practical techniques for stress management and mindful living',
    startDateTime: '2024-10-30T10:00:00',
    endDateTime: '2024-10-30T15:00:00',
    venue: 'Serenity Spa',
    address: '654 Wellness Way, Austin, TX',
    category: 'Health',
    eventType: 'Workshop',
    capacity: 50,
    currentRegistrations: 45,
    remainingCapacity: 5,
    primaryImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    isRegistrationOpen: true,
    isUserRegistered: false,
  },
  {
    id: 6,
    title: 'Startup Pitch Competition',
    description: 'Watch innovative startups compete for funding and mentorship opportunities',
    startDateTime: '2024-11-12T18:00:00',
    endDateTime: '2024-11-12T21:00:00',
    venue: 'Entrepreneur Hub',
    address: '987 Startup Ave, San Francisco, CA',
    category: 'Business',
    eventType: 'Competition',
    capacity: 150,
    currentRegistrations: 150,
    remainingCapacity: 0,
    primaryImageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=250&fit=crop',
    isRegistrationOpen: false,
    isUserRegistered: false,
  },
]

const categories = ['All', 'Technology', 'Business', 'Arts', 'Health', 'Education', 'Sports']
const eventTypes = ['All', 'Conference', 'Workshop', 'Seminar', 'Exhibition', 'Networking', 'Competition']

export const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedEventType, setSelectedEventType] = useState('All')
  const [sortBy, setSortBy] = useState('startDateTime')

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    const matchesEventType = selectedEventType === 'All' || event.eventType === selectedEventType
    
    return matchesSearch && matchesCategory && matchesEventType
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-60"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-40"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6 animate-fade-in">
              <Icon name="Calendar" className="w-4 h-4 mr-2" />
              {mockEvents.length} Amazing Events Available
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              Discover
              <span className="relative inline-block ml-3">
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Events
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full"></div>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
              Find and join amazing events happening in your area. From professional conferences to creative workshops.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{mockEvents.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {mockEvents.filter(e => e.isRegistrationOpen).length}
                </div>
                <div className="text-sm text-gray-600">Open Registration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {new Set(mockEvents.map(e => e.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-12 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
              <SearchBox
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-6 border-t border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-gray-600">
                Showing <span className="text-blue-600 font-semibold">{filteredEvents.length}</span> of <span className="font-semibold">{mockEvents.length}</span> events
              </p>
              {(searchTerm || selectedCategory !== 'All' || selectedEventType !== 'All') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('All')
                    setSelectedEventType('All')
                  }}
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <Icon name="X" className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Sort by:</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDateTime">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="capacity">Capacity</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="animate-fade-in" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
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
                        {event.category}
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
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <Icon name="Calendar" className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No events found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any events matching your criteria. Try adjusting your filters or browse all events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('All')
                  setSelectedEventType('All')
                }}
                className="bg-white hover:bg-gray-50 border-gray-200"
              >
                <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
            </div>
          </div>
        )}

        {/* Load More Section */}
        {filteredEvents.length > 0 && filteredEvents.length >= 6 && (
          <div className="text-center mt-16 animate-fade-in">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 px-8"
            >
              <Icon name="ChevronDown" className="w-4 h-4 mr-2" />
              Load More Events
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}