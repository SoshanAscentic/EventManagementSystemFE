import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon, Spinner } from '@/components/atoms'
import { EventCard } from '@/components/organisms'
import { useGetUpcomingEventsQuery, useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useGetActiveCategoriesQuery } from '@/features/categories/api/categoriesApi'
import { useGetDashboardQuery } from '@/features/admin/api/adminApi'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import { useMemo } from 'react'

export const HomePage = () => {

  // Fetch upcoming events for featured section
  const { 
    data: upcomingEventsData, 
    isLoading: eventsLoading, 
    error: eventsError,
  } = useGetUpcomingEventsQuery({ count: 3 }, {
    refetchOnMountOrArgChange: true
  })

  // Fetch active categories
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError,
  } = useGetActiveCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true
  })

  // Get a broader set of events for statistics
  const { 
    data: allEventsData, 
    isLoading: statsLoading,
  } = useGetEventsQuery({
    pageNumber: 1,
    pageSize: 100,
  }, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  })

  // Get dashboard statistics for total users count
  const { 
    data: dashboardStatsData, 
    isLoading: dashboardLoading,
    error: dashboardError
  } = useGetDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true
  })

  // Fallback: Get users data if dashboard fails (for total count)
  const { 
    data: usersData, 
    isLoading: usersLoading,
  } = useGetUsersQuery({
    pageNumber: 1,
    pageSize: 1
  }, {
    skip: !dashboardError,
    refetchOnMountOrArgChange: true
  })

  const featuredEvents = upcomingEventsData?.data || []
  const categories = categoriesData?.data || []
  const allEvents = allEventsData?.data?.items || []
  const dashboardStats = dashboardStatsData?.data
  const usersPageData = usersData?.data

  // Calculate dynamic statistics from available data
  const statistics = useMemo(() => {
    const totalEvents = allEvents.length
    const activeEvents = allEvents.filter(event => 
      event.isRegistrationOpen && 
      new Date(event.startDateTime) > new Date()
    ).length
    
    // Use dashboard stats for total users, fallback to users API total count
    let totalUsers = 0
    
    if (dashboardStats?.totalUsers) {
      totalUsers = dashboardStats.totalUsers
    } else if (usersPageData?.totalCount) {
      totalUsers = usersPageData.totalCount
    }
    
    const totalCategories = categories.length

    return {
      totalEvents,
      activeEvents,
      totalUsers,
      totalCategories
    }
  }, [allEvents, categories, dashboardStats, usersPageData])

  // Enhanced categories with counts from events data
  const categoriesWithCounts = useMemo(() => {
    if (!categories.length || !allEvents.length) return []

    return categories.slice(0, 6).map(category => {
      const categoryEvents = allEvents.filter(event => event.categoryId === category.id)
      
      // Map category names to icons
      const iconMap: Record<string, string> = {
        'Technology': 'Laptop',
        'Business': 'Briefcase', 
        'Arts': 'Palette',
        'Health': 'Heart',
        'Education': 'GraduationCap',
        'Sports': 'Trophy',
        'Entertainment': 'Music',
        'Science': 'Microscope',
      }

      // Map category names to colors
      const colorMap: Record<string, string> = {
        'Technology': 'from-blue-500 to-cyan-500',
        'Business': 'from-green-500 to-emerald-500',
        'Arts': 'from-purple-500 to-pink-500',
        'Health': 'from-red-500 to-rose-500',
        'Education': 'from-yellow-500 to-orange-500',
        'Sports': 'from-indigo-500 to-blue-500',
        'Entertainment': 'from-violet-500 to-purple-500',
        'Science': 'from-teal-500 to-cyan-500',
      }

      return {
        ...category,
        icon: iconMap[category.name] || 'Folder',
        color: colorMap[category.name] || 'from-gray-500 to-gray-600',
        count: categoryEvents.length
      }
    })
  }, [categories, allEvents])

  const handleRegister = () => {
    // This will be implemented with the registration API
  }

  // Loading state
  const isLoadingUsers = dashboardLoading || (dashboardError && usersLoading)
  if (eventsLoading || categoriesLoading || statsLoading || isLoadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" className="mb-4" />
          <p className="text-gray-600">Loading EventHub...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (eventsError || categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="AlertCircle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Content</h1>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the latest events and categories. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Professional Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20"></div>
          
          {/* Geometric shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-60"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-40"></div>
          
          {/* Dot pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-indigo-400 rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-300 rounded-full"></div>
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Content Side */}
              <div className="space-y-8">
                {/* Professional Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 animate-fade-in">
                  <Icon name="Sparkles" className="w-4 h-4 mr-2" />
                  Trusted by {statistics.totalUsers.toLocaleString()}+ Event Participants
                </div>
                
                {/* Main Headline */}
                <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Create & Manage
                    <span className="relative inline-block ml-3">
                      <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Events
                      </span>
                      <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full"></div>
                    </span>
                    <br />
                    That Matter
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                    The professional platform for creating, promoting, and managing successful events. 
                    From intimate workshops to large conferences.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    asChild
                  >
                    <Link to="/events">
                      <Icon name="Calendar" className="mr-2 h-5 w-5" />
                      Explore Events
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                    asChild
                  >
                    <Link to="/auth/register">
                      <Icon name="Plus" className="mr-2 h-5 w-5" />
                      Get Started
                    </Link>
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">+{Math.floor(statistics.totalUsers / 100)}K</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Active participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Icon key={i} name="Star" className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium ml-1">4.9/5 rating</span>
                  </div>
                </div>
              </div>
              
              {/* Visual Side */}
              <div className="relative animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="relative">
                  {/* Dashboard Mockup */}
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-2 hover:rotate-1 transition-transform duration-500">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Icon name="Calendar" className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white font-semibold">EventHub Dashboard</span>
                        </div>
                        <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-blue-600">{statistics.totalEvents}</div>
                          <div className="text-xs text-blue-500">Total Events</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-green-600">{statistics.totalUsers.toLocaleString()}</div>
                          <div className="text-xs text-green-500">Participants</div>
                        </div>
                      </div>
                      
                      {/* Event List Preview */}
                      <div className="space-y-2">
                        {featuredEvents.slice(0, 2).map((event, index) => (
                          <div key={event.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded ${index === 0 ? 'bg-blue-100' : 'bg-violet-100'}`}></div>
                            <div className="flex-1">
                              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-1.5 bg-gray-100 rounded w-1/2 mt-1"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                    <Icon name="TrendingUp" className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="absolute -bottom-6 -left-6 w-20 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-3 transition-transform duration-300">
                    <Icon name="Users" className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Notification Badge */}
                  <div className="absolute top-8 -left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100 transform -rotate-6 hover:-rotate-3 transition-transform duration-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-gray-700">New Registration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Dynamic Stats Section */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30"></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl rotate-45 opacity-20 animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6 animate-fade-in">
              <Icon name="TrendingUp" className="w-4 h-4 mr-2" />
              Real-time Platform Metrics
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in" style={{animationDelay: '0.1s'}}>
              Platform 
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                Statistics
              </span>
            </h2>
            <p className="text-lg text-gray-600 animate-fade-in" style={{animationDelay: '0.2s'}}>
              See how our community is growing and thriving
            </p>
          </div>
          
          {/* Dynamic Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Total Events Card */}
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon name="Calendar" className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                      <Icon name="TrendingUp" className="h-3 w-3 mr-1" />
                      Live
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.totalEvents.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-500">Across all categories</p>
                </div>
              </div>
            </div>

            {/* Active Events Card */}
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon name="Users" className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                      <Icon name="TrendingUp" className="h-3 w-3 mr-1" />
                      Active
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Participants</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.totalUsers.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-500">Registered across all events</p>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon name="Folder" className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center text-gray-600 text-sm font-medium bg-gray-50 px-2 py-1 rounded-full">
                      <Icon name="Minus" className="h-3 w-3 mr-1" />
                      Categories
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Event Categories</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.totalCategories}</p>
                  </div>
                  <p className="text-xs text-gray-500">Different event types</p>
                </div>
              </div>
            </div>

            {/* Active Events Card */}
            <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon name="TrendingUp" className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                      <Icon name="TrendingUp" className="h-3 w-3 mr-1" />
                      Open
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Open for Registration</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.activeEvents}</p>
                  </div>
                  <p className="text-xs text-gray-500">Events accepting registrations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="animate-fade-in" style={{animationDelay: '0.7s'}}>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center hover:bg-white/80 transition-colors duration-300">
                <p className="text-2xl font-bold text-blue-600 mb-1">98.5%</p>
                <p className="text-sm text-gray-600">User Satisfaction</p>
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.8s'}}>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center hover:bg-white/80 transition-colors duration-300">
                <p className="text-2xl font-bold text-green-600 mb-1">99.9%</p>
                <p className="text-sm text-gray-600">Platform Uptime</p>
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.9s'}}>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center hover:bg-white/80 transition-colors duration-300">
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round((statistics.totalUsers / statistics.totalEvents) * 10) / 10}
                </p>
                <p className="text-sm text-gray-600">Avg. Participants per Event</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Featured Events */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {featuredEvents.length > 0 
                ? "Don't miss these amazing upcoming events happening soon"
                : "Check back soon for exciting upcoming events"
              }
            </p>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event, index) => (
                <div key={event.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <EventCard 
                    event={event}
                    showActions={true}
                    onRegister={handleRegister}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="Calendar" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Featured Events Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create an amazing event!</p>
              <Button asChild>
                <Link to="/auth/register">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            </div>
          )}

          {featuredEvents.length > 0 && (
            <div className="text-center mt-16">
              <Button variant="outline" size="lg" className="hover-lift shadow-md bg-white" asChild>
                <Link to="/events">
                  View All Events
                  <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">
              Find events that match your interests
            </p>
          </div>

          {categoriesWithCounts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categoriesWithCounts.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/events?categoryId=${category.id}`}
                  className="group animate-fade-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <Card className="text-center hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 bg-white h-full">
                    <CardContent className="p-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon name={category.icon as any} className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">{category.count} events</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="Folder" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Available</h3>
              <p className="text-gray-600">Categories will appear here once they are created.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Create Your Own Event?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join {Math.floor(statistics.totalUsers / 100) * 100}+ event participants who trust EventHub to discover and attend amazing events
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover-lift" asChild>
                <Link to="/events">
                  <Icon name="Calendar" className="mr-2 h-5 w-5" />
                  Explore Events
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm text-white hover-lift" asChild>
                <Link to="/auth/register">
                  <Icon name="UserPlus" className="mr-2 h-5 w-5" />
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose EventHub?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to discover, join, and manage successful events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6">
                <Icon name="Zap" className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Find and register for events in minutes with our intuitive search and filtering options.
              </p>
            </div>
            
            <div className="text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6">
                <Icon name="Users" className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect with Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a vibrant community of {statistics.totalUsers.toLocaleString()}+ event enthusiasts and expand your network.
              </p>
            </div>
            
            <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                <Icon name="BarChart3" className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibent text-gray-900 mb-4">Track Your Events</h3>
              <p className="text-gray-600 leading-relaxed">
                Keep track of your registrations and get notified about upcoming events you've joined.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}