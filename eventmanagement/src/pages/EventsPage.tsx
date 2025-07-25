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
]

const categories = ['All', 'Technology', 'Business', 'Arts', 'Health', 'Education', 'Sports']
const eventTypes = ['All', 'Conference', 'Workshop', 'Seminar', 'Exhibition', 'Networking']

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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Events</h1>
        <p className="text-lg text-gray-600">
          Find and join amazing events happening in your area
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBox
              placeholder="Search events..."
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
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

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Showing {filteredEvents.length} of {mockEvents.length} events
          </p>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startDateTime">Sort by Date</SelectItem>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="capacity">Sort by Capacity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={event.primaryImageUrl}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant={event.remainingCapacity > 0 ? 'default' : 'destructive'}>
                  {event.remainingCapacity > 0 ? `${event.remainingCapacity} spots left` : 'Full'}
                </Badge>
              </div>
              {event.isUserRegistered && (
                <Badge className="absolute top-4 left-4 bg-green-500">
                  Registered
                </Badge>
              )}
            </div>

            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant="outline">{event.eventType}</Badge>
              </div>

              <h3 className="text-xl font-semibold mb-2 line-clamp-1">{event.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Icon name="Calendar" className="mr-2 h-4 w-4" />
                  {new Date(event.startDateTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Icon name="MapPin" className="mr-2 h-4 w-4" />
                  {event.venue}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Icon name="Users" className="mr-2 h-4 w-4" />
                  {event.currentRegistrations}/{event.capacity} registered
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to={`/events/${event.id}`}>View Details</Link>
                </Button>
                {event.isUserRegistered ? (
                  <Badge variant="secondary" className="flex-1 justify-center py-2">
                    Registered
                  </Badge>
                ) : (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    disabled={event.remainingCapacity === 0}
                  >
                    {event.remainingCapacity === 0 ? 'Full' : 'Register'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Calendar" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all events
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('')
            setSelectedCategory('All')
            setSelectedEventType('All')
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}