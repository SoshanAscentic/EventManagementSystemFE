// src/pages/EventManagementPage.tsx
import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge, Icon, Spinner } from '@/components/atoms'
import { SearchBox } from '@/components/molecules'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useGetEventsQuery, useDeleteEventMutation } from '@/features/events/api/eventsApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { formatEventDateTime, formatRelativeTime } from '@/shared/utils/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'

export const EventManagementPage = () => {
  const location = useLocation()
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()

  // Fetch events with filters
  const { 
    data: eventsData, 
    isLoading, 
    error,
    refetch 
  } = useGetEventsQuery({
    pageNumber: currentPage,
    pageSize: 12,
    searchTerm: debouncedSearchTerm || undefined,
    Ascending: false, // Newest first
  })

  const events = eventsData?.data?.items || []
  const totalItems = eventsData?.data?.totalCount || 0
  const totalPages = eventsData?.data?.totalPages || 1
  const hasNextPage = eventsData?.data?.hasNextPage || false
  const hasPreviousPage = eventsData?.data?.hasPreviousPage || false

  // Filter events client-side by status
  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') return events
    
    return events.filter(event => {
      const now = new Date()
      const startDate = new Date(event.startDateTime)
      const isUpcoming = startDate > now
      const isActive = event.isRegistrationOpen
      
      switch (statusFilter) {
        case 'active':
          return isActive && isUpcoming
        case 'upcoming':
          return isUpcoming
        case 'past':
          return !isUpcoming
        case 'draft':
          return !isActive
        default:
          return true
      }
    })
  }, [events, statusFilter])

  // Success message from location state
  const successMessage = location.state?.message

  const handleDelete = async (eventId: number) => {
    try {
      await deleteEvent(eventId).unwrap()
      setDeletingEventId(null)
      refetch() // Refresh the events list
      // You could add a success toast here
    } catch (error: any) {
      console.error('Failed to delete event:', error)
      // You could add an error toast here
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getEventStatus = (event: any) => {
    const now = new Date()
    const startDate = new Date(event.startDateTime)
    const isUpcoming = startDate > now
    const isActive = event.isRegistrationOpen

    if (!isActive) return { label: 'Draft', color: 'bg-gray-100 text-gray-800' }
    if (!isUpcoming) return { label: 'Completed', color: 'bg-blue-100 text-blue-800' }
    if (event.remainingCapacity === 0) return { label: 'Sold Out', color: 'bg-red-100 text-red-800' }
    return { label: 'Active', color: 'bg-green-100 text-green-800' }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          {hasPermission('canCreateEvents') && (
            <Button asChild>
              <Link to="/admin/events/create">
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          )}
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
          <CardContent className="py-12 text-center">
            <Icon name="AlertCircle" className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Events</h3>
            <p className="text-gray-500 mb-6">There was an error loading the events. Please try again.</p>
            <Button onClick={() => refetch()}>
              <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">Create and manage all events</p>
        </div>
        
        {hasPermission('canCreateEvents') && (
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/admin/events/create">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by title..."
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredEvents.length} of {totalItems} events
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event)
              
              return (
                <Card key={event.id} className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={event.primaryImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop'}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                      ID: {event.id}
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Icon name="Calendar" className="h-4 w-4 mr-2 text-blue-500" />
                        {formatEventDateTime(event.startDateTime, event.endDateTime)}
                      </div>
                      <div className="flex items-center">
                        <Icon name="MapPin" className="h-4 w-4 mr-2 text-red-500" />
                        {event.venue}
                      </div>
                      <div className="flex items-center">
                        <Icon name="Users" className="h-4 w-4 mr-2 text-green-500" />
                        {event.currentRegistrations}/{event.capacity} registered
                      </div>
                      <div className="flex items-center">
                        <Icon name="Clock" className="h-4 w-4 mr-2 text-orange-500" />
                        Created {formatRelativeTime(event.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link to={`/events/${event.id}`}>
                          <Icon name="Eye" className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      
                      {hasPermission('canEditEvents') && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link to={`/admin/events/${event.id}/edit`}>
                            <Icon name="Edit" className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      )}
                      
                      {hasPermission('canDeleteEvents') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingEventId(event.id)}
                          className="px-3"
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalItems} total events)
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  className="bg-white hover:bg-gray-50"
                >
                  <Icon name="ChevronLeft" className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="bg-white hover:bg-gray-50"
                >
                  Next
                  <Icon name="ChevronRight" className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
          <CardContent className="py-12 text-center">
            <Icon name="Calendar" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No events match your criteria' : 'No events created yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first event.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="bg-white hover:bg-gray-50"
                >
                  <Icon name="X" className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              {hasPermission('canCreateEvents') && (
                <Button asChild>
                  <Link to="/admin/events/create">
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deletingEventId !== null}
        onOpenChange={() => setDeletingEventId(null)}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone and will cancel all registrations."
        onConfirm={() => deletingEventId && handleDelete(deletingEventId)}
        loading={isDeleting}
        variant="destructive"
        confirmText="Delete Event"
      />
    </div>
  )
}