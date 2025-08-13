import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icon, Spinner } from '@/components/atoms'
import { SearchBox } from '@/components/molecules'
import { UserCard } from '@/components/organisms/UserCard/UserCard'
import { useGetUsersQuery, useGetUserByIdQuery } from '@/features/users/api/usersApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { formatUserInitials, formatDate } from '@/shared/utils/formatters'

export const UserManagementPage = () => {
  const location = useLocation()
  const { hasPermission } = useAuth()
  const [searchInput, setSearchInput] = useState('') // Input field state
  const [searchTerm, setSearchTerm] = useState('') // Actual search term sent to API
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  // Fetch users with server-side search and pagination
  const { 
    data: usersData, 
    isLoading, 
    error,
    refetch 
  } = useGetUsersQuery({
    searchTerm: searchTerm || '',
    pageNumber: currentPage,
    pageSize: 6,
    ascending: true,
  }, {
    // Keep cache but allow refetch on search change
    refetchOnMountOrArgChange: 30, // Refetch if query is older than 30 seconds
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  // Fetch selected user details
  const { 
    data: selectedUserData,
    isLoading: isLoadingUserDetails,
    error: userDetailsError
  } = useGetUserByIdQuery(selectedUserId!, {
    skip: !selectedUserId,
  })

  const users = usersData?.data?.items || []
  const totalItems = usersData?.data?.totalCount || 0
  const totalPages = usersData?.data?.totalPages || 1
  const hasNextPage = usersData?.data?.hasNextPage || false
  const hasPreviousPage = usersData?.data?.hasPreviousPage || false

  // Success message from location state
  const successMessage = location.state?.message

  // Handle search execution
  const executeSearch = useCallback(() => {
    setSearchTerm(searchInput.trim())
    setCurrentPage(1) // Reset to first page when searching
  }, [searchInput])

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearchTerm('')
    setCurrentPage(1)
  }, [])

  const handleViewDetails = useCallback((userId: number) => {
    setSelectedUserId(userId)
  }, [])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
          <CardContent className="py-12 text-center">
            <Icon name="AlertCircle" className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Users</h3>
            <p className="text-gray-500 mb-6">There was an error loading the users. Please try again.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">View and search registered users</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Icon name="Users" className="w-4 h-4" />
          <span>{totalItems} total users</span>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <CardHeader>
          <CardTitle className="text-lg">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by name or email</label>
              <div className="flex gap-2">
                <SearchBox
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search users..."
                  className="flex-1"
                />
                <Button
                  onClick={executeSearch}
                  size="sm"
                  className="px-3"
                  disabled={isLoading}
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

            <div className="text-sm text-gray-600">
              {searchTerm ? (
                <>Showing {users.length} of {totalItems} users matching "{searchTerm}"</>
              ) : (
                <>Showing {users.length} of {totalItems} users</>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {users.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            {users.map((user, index) => (
              <div key={user.id} className="animate-fade-in" style={{animationDelay: `${0.05 * index}s`}}>
                <UserCard 
                  user={user}
                  variant="admin"
                  onViewDetails={hasPermission('canManageUsers') ? handleViewDetails : undefined}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalItems} total users)
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
              <Icon name="Users" className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No users match your search' : 'No users found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? `No users found matching "${searchTerm}". Try a different search term.`
                : 'There are no registered users in the system yet.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={handleClearSearch}
                  className="bg-white hover:bg-gray-50"
                >
                  <Icon name="X" className="mr-2 h-4 w-4" />
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Details Modal - existing code unchanged */}
      {selectedUserId && selectedUserData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Icon name="User" className="mr-2 h-5 w-5 text-blue-600" />
                User Details
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUserId(null)}
                className="h-8 w-8 p-0"
              >
                <Icon name="X" className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingUserDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="large" />
                </div>
              ) : userDetailsError ? (
                <div className="text-center py-8">
                  <Icon name="AlertCircle" className="mx-auto h-8 w-8 text-red-500 mb-2" />
                  <p className="text-red-600">Failed to load user details</p>
                </div>
              ) : selectedUserData?.data ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {formatUserInitials(selectedUserData.data.firstName, selectedUserData.data.lastName)}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {selectedUserData.data.firstName} {selectedUserData.data.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedUserData.data.email}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">User ID:</span>
                      <p>{selectedUserData.data.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Status:</span>
                      <p>{selectedUserData.data.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Roles:</span>
                      <p>{selectedUserData.data.roles?.join(', ') || 'None'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Phone:</span>
                      <p>{selectedUserData.data.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-500">Joined:</span>
                      <p>{formatDate(selectedUserData.data.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}