import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchBox } from '@/components/molecules'
import { EventCard } from '@/components/organisms'
import { Icon, Badge, Spinner } from '@/components/atoms'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useGetActiveCategoriesQuery } from '@/features/categories/api/categoriesApi'
import { EventDto } from '@/shared/types/domain'
import { EVENT_TYPES } from '@/shared/utils/constants'

export const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // State for filters
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '') // Input field state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '') // Actual search term sent to API
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined
  )
  const [selectedEventType, setSelectedEventType] = useState<string | undefined>(
    searchParams.get('eventType') || undefined
  )
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'startDateTime')
  const [ascending, setAscending] = useState<boolean>(
    searchParams.get('ascending') !== 'false' // Default to true unless explicitly false
  )
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') || '1')
  )

  // Fetch categories for filter dropdown
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading 
  } = useGetActiveCategoriesQuery()

  // Fetch events with current filters
  const { 
    data: eventsData, 
    isLoading: eventsLoading, 
    error: eventsError,
    refetch: refetchEvents
  } = useGetEventsQuery({
    pageNumber: currentPage,
    pageSize: 12,
    searchTerm: searchTerm || undefined,
    categoryId: selectedCategoryId,
    eventType: selectedEventType,
    sortBy: sortBy as any,
    Ascending: ascending,
  }, {
    // Improved caching
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    keepUnusedDataFor: 60,
  })

  const categories = categoriesData?.data || []
  const events = eventsData?.data?.items || []
  const totalItems = eventsData?.data?.totalCount || 0
  const totalPages = eventsData?.data?.totalPages || 1
  const hasNextPage = eventsData?.data?.hasNextPage || false
  const hasPreviousPage = eventsData?.data?.hasPreviousPage || false

  // Handle search execution
  const executeSearch = useCallback(() => {
    setSearchTerm(searchInput.trim())
    setCurrentPage(1) // Reset to first page when searching
  }, [searchInput])

  // Handle Enter key press - RENAME this function
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch()
    }
  }, [executeSearch])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearchTerm('')
    setCurrentPage(1)
  }, [])

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategoryId) params.set('categoryId', selectedCategoryId.toString())
    if (selectedEventType) params.set('eventType', selectedEventType)
    if (sortBy !== 'startDateTime') params.set('sortBy', sortBy)
    if (!ascending) params.set('ascending', 'false')
    if (currentPage > 1) params.set('page', currentPage.toString())

    setSearchParams(params, { replace: true })
  }, [searchTerm, selectedCategoryId, selectedEventType, sortBy, ascending, currentPage, setSearchParams])

  // Calculate statistics from current data
  const statistics = useMemo(() => {
    const openRegistrationCount = events.filter(event => event.isRegistrationOpen).length
    const totalRegistrations = events.reduce((sum, event) => sum + event.currentRegistrations, 0)
    const uniqueCategories = new Set(events.map(event => event.categoryId)).size

    return {
      totalEvents: totalItems,
      openRegistration: openRegistrationCount,
      totalRegistrations,
      uniqueCategories,
    }
  }, [events, totalItems])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setSelectedCategoryId(undefined)
    setSelectedEventType(undefined)
    setSortBy('startDateTime')
    setAscending(true)
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCategoryId || selectedEventType || sortBy !== 'startDateTime' || !ascending

  // Handle event registration
  const handleRegister = (eventId: number) => {
    console.log('Register for event:', eventId)
    // This will be implemented with the registration API in Phase 2
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Loading state
  if (categoriesLoading && eventsLoading) {
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
  if (eventsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Icon name="AlertCircle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Events</h1>
            <p className="text-gray-600 mb-6">
              We're having trouble loading events right now. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetchEvents()}>
                <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={clearAllFilters}>
                <Icon name="X" className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
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
              {statistics.totalEvents.toLocaleString()} Amazing Events Available
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{statistics.totalEvents.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {statistics.openRegistration.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Open Registration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {statistics.totalRegistrations.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {categories.length}
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Search */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
              <div className="flex gap-2">
                <SearchBox
                  placeholder="Search by title or description..."
                  value={searchInput}
                  onChange={setSearchInput}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={executeSearch}
                  size="sm"
                  className="px-3"
                  disabled={eventsLoading}
                >
                  <Icon name="Search" className="h-4 w-4" />
                </Button>
                {searchTerm && (
                  <Button
                    onClick={handleClearSearch}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <Icon name="X" className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select 
                value={selectedCategoryId?.toString() || 'all'} 
                onValueChange={(value) => {
                  setSelectedCategoryId(value === 'all' ? undefined : parseInt(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Type Filter */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <Select 
                value={selectedEventType || 'all'} 
                onValueChange={(value) => {
                  setSelectedEventType(value === 'all' ? undefined : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <Select 
                value={`${sortBy}-${ascending ? 'asc' : 'desc'}`} 
                onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  setSortBy(field)
                  setAscending(order === 'asc')
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-blue-300 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDateTime-asc">Date (Earliest)</SelectItem>
                  <SelectItem value="startDateTime-desc">Date (Latest)</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="capacity-desc">Capacity (Largest)</SelectItem>
                  <SelectItem value="capacity-asc">Capacity (Smallest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-6 border-t border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-gray-600">
                Showing <span className="text-blue-600 font-semibold">{events.length}</span> of <span className="font-semibold">{statistics.totalEvents.toLocaleString()}</span> events
                {currentPage > 1 && (
                  <span className="text-gray-500"> (Page {currentPage} of {totalPages})</span>
                )}
                {searchTerm && (
                  <span className="text-gray-500"> matching "{searchTerm}"</span>
                )}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <Icon name="X" className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            {/* Loading indicator for search */}
            {eventsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="small" />
                <span>Searching...</span>
              </div>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.map((event, index) => (
                <div key={event.id} className="animate-fade-in" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                  <EventCard 
                    event={event}
                    showActions={true}
                    onRegister={handleRegister}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({statistics.totalEvents.toLocaleString()} total events)
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
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <Icon name="Calendar" className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {hasActiveFilters ? 'No events match your criteria' : 'No events available'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {hasActiveFilters 
                ? "Try adjusting your filters or search terms to find more events."
                : "There are no events available at the moment. Check back later for new events!"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="bg-white hover:bg-gray-50 border-gray-200"
                >
                  <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" asChild>
                <a href="/auth/register">
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  Create New Event
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
