import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icon, Spinner, Badge } from '@/components/atoms'
import { SearchBox } from '@/components/molecules'
import { useGetCategoriesQuery, type Category } from '@/features/categories/api/categoriesApi'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'

// Define enhanced category type
interface EnhancedCategory extends Category {
  eventCount: number
  activeEventCount: number
  totalRegistrations: number
  averageCapacity: number
}

export const CategoriesManagementPage = () => {
  const location = useLocation()
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12 // Client-side pagination
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch ALL categories (using proper params)
  const { 
    data: allCategoriesData, 
    isLoading: categoriesLoading, 
    error,
    refetch 
  } = useGetCategoriesQuery({
    isActive: undefined // Get both active and inactive categories
  })

  // Fetch all events to calculate category statistics
  const {
    data: eventsResponse,
    isLoading: eventsLoading
  } = useGetEventsQuery({
    pageNumber: 1,
    pageSize: 1000, // Get a large number to calculate accurate stats
  })

  // Fix: Handle the correct data structure
  const allCategories = allCategoriesData?.data?.data?.items || allCategoriesData?.data || []
  const allEvents = eventsResponse?.data?.items || []

  // Calculate enhanced category data with event counts
  const enhancedCategories = useMemo((): EnhancedCategory[] => {
    if (!Array.isArray(allCategories)) {
      return []
    }
    return allCategories.map((category: Category) => {
      const categoryEvents = allEvents.filter((event: any) => event.categoryId === category.id)
      const activeEvents = categoryEvents.filter((event: any) => 
        event.isRegistrationOpen && new Date(event.startDateTime) > new Date()
      )
      const totalRegistrations = categoryEvents.reduce((sum: number, event: any) => sum + event.currentRegistrations, 0)

      return {
        ...category,
        eventCount: categoryEvents.length,
        activeEventCount: activeEvents.length,
        totalRegistrations,
        averageCapacity: categoryEvents.length > 0 
          ? Math.round(categoryEvents.reduce((sum: number, event: any) => sum + event.capacity, 0) / categoryEvents.length)
          : 0
      }
    })
  }, [allCategories, allEvents])

  // Client-side filtering and search
  const filteredCategories = useMemo(() => {
    let filtered = enhancedCategories

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter((category: EnhancedCategory) => 
        category.name.toLowerCase().includes(searchLower) ||
        (category.description && category.description.toLowerCase().includes(searchLower))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((category: EnhancedCategory) => {
        switch (statusFilter) {
          case 'active':
            return category.isActive
          case 'inactive':
            return !category.isActive
          case 'with-events':
            return category.eventCount && category.eventCount > 0
          case 'empty':
            return !category.eventCount || category.eventCount === 0
          default:
            return true
        }
      })
    }

    return filtered
  }, [enhancedCategories, debouncedSearchTerm, statusFilter])

  // Client-side pagination
  const totalItems = filteredCategories.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  // Success message from location state
  const successMessage = location.state?.message

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, statusFilter])

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
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          {hasPermission('canManageCategories') && (
            <Button asChild>
              <Link to="/admin/categories/create">
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Create Category
              </Link>
            </Button>
          )}
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
          <CardContent className="py-12 text-center">
            <Icon name="AlertCircle" className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Categories</h3>
            <p className="text-gray-500 mb-6">There was an error loading the categories. Please try again.</p>
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
        <Alert className="bg-green-50 border-green-200 animate-fade-in">
          <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Organize and manage event categories</p>
        </div>
        
        {hasPermission('canManageCategories') && (
          <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Link to="/admin/categories/create">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Create Category
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Categories</label>
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name or description..."
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
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="with-events">With Events</SelectItem>
                  <SelectItem value="empty">Empty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {paginatedCategories.length} of {totalItems} categories
                {statusFilter !== 'all' && ` (filtered by ${statusFilter.replace('-', ' ')})`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {paginatedCategories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            {paginatedCategories.map((category: EnhancedCategory, index: number) => (
              <div key={category.id} className="animate-fade-in" style={{animationDelay: `${0.05 * index}s`}}>
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

                      {/* Admin Action Buttons */}
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
                        
                        {hasPermission('canManageCategories') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-colors"
                            onClick={() => {
                              // Add edit functionality when backend supports it
                              console.log('Edit category:', category.id)
                            }}
                            title="Edit category (requires backend implementation)"
                          >
                            <Icon name="Edit" className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalItems} total categories)
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
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <Icon name="Folder" className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No categories match your criteria' : 'No categories created yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Categories help organize events and make them easier to discover.'
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
              {hasPermission('canManageCategories') && (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Link to="/admin/categories/create">
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Create Category
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}