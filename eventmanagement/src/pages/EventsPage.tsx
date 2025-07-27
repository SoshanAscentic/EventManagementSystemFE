import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchBox } from '@/components/molecules'
import { EventCard } from '@/components/organisms'
import { Icon, Badge } from '@/components/atoms'
import { EventDto } from '@/shared/types/domain'

// Mock data for Phase 1
const mockEvents: EventDto[] = [
  {
    id: 1,
    title: 'React Conference 2024',
    description: 'The biggest React conference of the year with industry experts',
    startDateTime: '2024-10-15T09:00:00',
    endDateTime: '2024-10-15T17:00:00',
    venue: 'Tech Center',
    address: '123 Tech Street, San Francisco, CA',
    city: 'San Francisco',
    country: 'USA',
    capacity: 500,
    eventType: 'Conference',
    categoryId: 1,
    categoryName: 'Technology',
    currentRegistrations: 450,
    remainingCapacity: 50,
    isRegistrationOpen: true,
    primaryImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
    images: [],
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2024-09-01T10:00:00',
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
    city: 'New York',
    country: 'USA',
    capacity: 100,
    eventType: 'Workshop',
    categoryId: 2,
    categoryName: 'Business',
    currentRegistrations: 75,
    remainingCapacity: 25,
    isRegistrationOpen: true,
    primaryImageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop',
    images: [],
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2024-09-01T10:00:00',
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
    city: 'Los Angeles',
    country: 'USA',
    capacity: 200,
    eventType: 'Exhibition',
    categoryId: 3,
    categoryName: 'Arts',
    currentRegistrations: 100,
    remainingCapacity: 100,
    isRegistrationOpen: true,
    primaryImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    images: [],
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2024-09-01T10:00:00',
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
    city: 'Seattle',
    country: 'USA',
    capacity: 300,
    eventType: 'Conference',
    categoryId: 1,
    categoryName: 'Technology',
    currentRegistrations: 180,
    remainingCapacity: 120,
    isRegistrationOpen: true,
    primaryImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
    images: [],
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2024-09-01T10:00:00',
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
    city: 'Austin',
    country: 'USA',
    capacity: 50,
    eventType: 'Workshop',
    categoryId: 4,
    categoryName: 'Health',
    currentRegistrations: 45,
    remainingCapacity: 5,
    isRegistrationOpen: true,
    primaryImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    images: [],
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2024-09-01T10:00:00',
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
    city: 'San Francisco',
    country: 'USA',
    capacity: 150,
    eventType: 'Competition',
    categoryId: 2,
    categoryName: 'Business',
    currentRegistrations: 150,
    remainingCapacity: 0,
    isRegistrationOpen: false,
    primaryImageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=250&fit=crop',
    images: [],
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2024-09-01T10:00:00',
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
    const matchesCategory = selectedCategory === 'All' || event.categoryName === selectedCategory
    const matchesEventType = selectedEventType === 'All' || event.eventType === selectedEventType
    
    return matchesSearch && matchesCategory && matchesEventType
  })

  const handleRegister = (eventId: number) => {
    console.log('Register for event:', eventId)
    // This will be implemented with the registration API in Phase 2
  }

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
                  {new Set(mockEvents.map(e => e.categoryName)).size}
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
                  <SelectItem value="categoryName">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Events Grid - Now using EventCard organism */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="animate-fade-in" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
                <EventCard 
                  event={event}
                  showActions={true}
                  onRegister={handleRegister}
                />
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