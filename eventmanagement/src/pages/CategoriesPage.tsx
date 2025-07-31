import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchBox } from '@/components/molecules'
import { Badge, Icon, Spinner } from '@/components/atoms'
import { Button } from '@/components/ui/button'
import { useGetActiveCategoriesQuery } from '@/features/categories/api/categoriesApi'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Link } from 'react-router-dom'

export const CategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch all categories (the API doesn't support search/pagination)
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch
  } = useGetActiveCategoriesQuery()

  // Fetch all events to calculate category statistics
  const {
    data: eventsResponse,
    isLoading: eventsLoading
  } = useGetEventsQuery({
    pageNumber: 1,
    pageSize: 1000, // Get a large number to calculate accurate stats
  })

  const allCategories = categoriesResponse?.data || []
  const allEvents = eventsResponse?.data?.items || []

  // Client-side filtering since the API doesn't support search
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm) return allCategories
    
    const searchLower = debouncedSearchTerm.toLowerCase()
    return allCategories.filter(category => 
      category.name.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower))
    )
  }, [allCategories, debouncedSearchTerm])

  // Calculate enhanced category data with event counts
  const enhancedCategories = useMemo(() => {
    return filteredCategories.map(category => {
      const categoryEvents = allEvents.filter(event => event.categoryId === category.id)
      const activeEvents = categoryEvents.filter(event => 
        event.isRegistrationOpen && new Date(event.startDateTime) > new Date()
      )
      const totalRegistrations = categoryEvents.reduce((sum, event) => sum + event.currentRegistrations, 0)

      return {
        ...category,
        eventCount: categoryEvents.length,
        activeEventCount: activeEvents.length,
        totalRegistrations,
        averageCapacity: categoryEvents.length > 0 
          ? Math.round(categoryEvents.reduce((sum, event) => sum + event.capacity, 0) / categoryEvents.length)
          : 0
      }
    })
  }, [filteredCategories, allEvents])

  // Calculate overall statistics
  const statistics = useMemo(() => {
    const totalCategories = allCategories.length
    const activeCategories = allCategories.filter(cat => cat.isActive).length
    const categoriesWithEvents = enhancedCategories.filter(cat => cat.eventCount > 0).length
    const totalEvents = allEvents.length

    return {
      totalCategories,
      activeCategories,
      categoriesWithEvents,
      totalEvents
    }
  }, [allCategories, enhancedCategories, allEvents])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value) {
      searchParams.set('search', value)
    } else {
      searchParams.delete('search')
    }
    setSearchParams(searchParams)
  }

  // Loading state
  if (categoriesLoading && eventsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Icon name="AlertCircle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Categories</h1>
            <p className="text-gray-600 mb-6">
              We're having trouble loading categories right now. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl -rotate-6 opacity-30"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-sm font-medium text-purple-700 mb-6">
              <Icon name="Folder" className="w-4 h-4 mr-2" />
              {statistics.totalCategories} Event Categories
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Event 
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                Categories
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse all event categories to find events that match your interests and passions.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Icon name="Folder" className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.totalCategories}
              </div>
              <p className="text-xs text-gray-600 mt-1">All categories</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.activeCategories}
              </div>
              <p className="text-xs text-gray-600 mt-1">Currently active</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Events</CardTitle>
              <Icon name="Calendar" className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.categoriesWithEvents}
              </div>
              <p className="text-xs text-gray-600 mt-1">Have events</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Icon name="TrendingUp" className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statistics.totalEvents}
              </div>
              <p className="text-xs text-gray-600 mt-1">Across all categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Categories</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {enhancedCategories.length} {enhancedCategories.length === 1 ? 'category' : 'categories'} found
                  {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <SearchBox
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search categories..."
                  className="w-full sm:w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {enhancedCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enhancedCategories.map((category, index) => (
                  <div key={category.id} className="animate-fade-in" style={{animationDelay: `${0.1 + index * 0.05}s`}}>
                    <Card className="h-full bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={category.isActive ? 'default' : 'secondary'} 
                            className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          {/* Statistics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-xl font-bold text-blue-600">{category.eventCount}</div>
                              <div className="text-xs text-blue-600">Total Events</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">{category.activeEventCount}</div>
                              <div className="text-xs text-green-600">Active Events</div>
                            </div>
                          </div>

                          {category.eventCount > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-2 bg-purple-50 rounded">
                                <div className="text-sm font-semibold text-purple-600">{category.totalRegistrations}</div>
                                <div className="text-xs text-purple-600">Registrations</div>
                              </div>
                              <div className="text-center p-2 bg-orange-50 rounded">
                                <div className="text-sm font-semibold text-orange-600">{category.averageCapacity}</div>
                                <div className="text-xs text-orange-600">Avg Capacity</div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors"
                              asChild
                            >
                              <Link to={`/events?categoryId=${category.id}`}>
                                <Icon name="Eye" className="mr-1 h-3 w-3" />
                                View Events
                              </Link>
                            </Button>
                            {category.eventCount > 0 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 px-2 py-1">
                                {category.eventCount} events
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 mb-6">
                  {debouncedSearchTerm 
                    ? `No categories match "${debouncedSearchTerm}". Try a different search term.`
                    : "No categories are available at the moment."
                  }
                </p>
                {debouncedSearchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                    className="bg-white hover:bg-gray-50"
                  >
                    <Icon name="X" className="mr-2 h-4 w-4" />
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Events */}
        <div className="text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link to="/events">
              <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
              Browse All Events
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}