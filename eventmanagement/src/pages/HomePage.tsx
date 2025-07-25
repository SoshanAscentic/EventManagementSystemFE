// Enhanced Large Screen Responsive HomePage
// src/pages/HomePage.tsx - Optimized for all screen sizes

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon, Badge } from '@/components/atoms'
import { StatCard } from '@/components/molecules'

const featuredEvents = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    description: 'Join us for the biggest tech conference of the year featuring industry leaders and cutting-edge innovations',
    startDateTime: '2024-09-15T09:00:00',
    venue: 'Convention Center',
    category: 'Technology',
    remainingCapacity: 50,
    primaryImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    title: 'Digital Marketing Masterclass',
    description: 'Learn advanced digital marketing strategies from industry experts and top practitioners',
    startDateTime: '2024-09-20T14:00:00',
    venue: 'Business Hub',
    category: 'Business',
    remainingCapacity: 25,
    primaryImageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    title: 'Contemporary Art Exhibition',
    description: 'Discover amazing contemporary art pieces from emerging and established artists worldwide',
    startDateTime: '2024-09-25T18:00:00',
    venue: 'Downtown Gallery',
    category: 'Arts',
    remainingCapacity: 100,
    primaryImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
  },
  {
    id: 4,
    title: 'Startup Pitch Competition',
    description: 'Watch innovative startups pitch their groundbreaking ideas to top investors and industry leaders',
    startDateTime: '2024-10-05T10:00:00',
    venue: 'Innovation Center',
    category: 'Business',
    remainingCapacity: 200,
    primaryImageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
  },
]

const categories = [
  { name: 'Technology', icon: 'Laptop' as const, count: 45, color: 'from-blue-500 to-cyan-500' },
  { name: 'Business', icon: 'Briefcase' as const, count: 32, color: 'from-green-500 to-emerald-500' },
  { name: 'Arts', icon: 'Palette' as const, count: 28, color: 'from-purple-500 to-pink-500' },
  { name: 'Health', icon: 'Heart' as const, count: 15, color: 'from-red-500 to-rose-500' },
  { name: 'Education', icon: 'GraduationCap' as const, count: 22, color: 'from-yellow-500 to-orange-500' },
  { name: 'Sports', icon: 'Trophy' as const, count: 18, color: 'from-indigo-500 to-blue-500' },
  { name: 'Music', icon: 'Music' as const, count: 35, color: 'from-pink-500 to-rose-500' },
  { name: 'Food', icon: 'Coffee' as const, count: 28, color: 'from-orange-500 to-red-500' },
]

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section - Optimized for Large Screens */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white hero-large-screen hero-ultrawide">
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0">
          {/* Enhanced Grid Pattern for Large Screens */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] xl:bg-[size:6rem_6rem] 2xl:bg-[size:8rem_8rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          
          {/* Adaptive Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20"></div>
          
          {/* Responsive Geometric Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 xl:w-48 xl:h-48 2xl:w-64 2xl:h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-60"></div>
          <div className="absolute top-40 right-20 w-24 h-24 xl:w-36 xl:h-36 2xl:w-48 2xl:h-48 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-32 left-1/4 w-28 h-28 xl:w-40 xl:h-40 2xl:w-52 2xl:h-52 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-40"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 xl:px-6 2xl:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 xl:grid-cols-5 gap-12 xl:gap-16 2xl:gap-20 items-center">
              
              {/* Content Side - Responsive Width */}
              <div className="space-y-8 xl:space-y-12 xl:col-span-3 hero-content">
                {/* Professional Badge - Responsive Sizing */}
                <div className="inline-flex items-center px-4 py-2 xl:px-6 xl:py-3 bg-blue-50 border border-blue-100 rounded-full text-sm xl:text-base font-medium text-blue-700 animate-fade-in">
                  <Icon name="Sparkles" className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
                  Trusted by 10,000+ Event Organizers
                </div>
                
                {/* Main Headline - Responsive Typography */}
                <div className="space-y-4 xl:space-y-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <h1 className="text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-gray-900 leading-tight">
                    Create & Manage
                    <span className="relative inline-block ml-3">
                      <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Events
                      </span>
                      <div className="absolute -bottom-2 left-0 w-full h-1 xl:h-1.5 2xl:h-2 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full"></div>
                    </span>
                    <br />
                    That Matter
                  </h1>
                  <p className="text-xl xl:text-2xl 2xl:text-3xl text-gray-600 leading-relaxed max-w-2xl xl:max-w-3xl">
                    The professional platform for creating, promoting, and managing successful events. 
                    From intimate workshops to large conferences.
                  </p>
                </div>
                
                {/* Enhanced CTA Buttons - Responsive Sizing */}
                <div className="flex flex-col sm:flex-row gap-4 xl:gap-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 xl:px-12 xl:py-6 text-lg xl:text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    asChild
                  >
                    <Link to="/events">
                      <Icon name="Calendar" className="mr-2 h-5 w-5 xl:h-6 xl:w-6" />
                      Explore Events
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-8 py-4 xl:px-12 xl:py-6 text-lg xl:text-xl font-semibold rounded-xl transition-all duration-300"
                    asChild
                  >
                    <Link to="/events/create">
                      <Icon name="Plus" className="mr-2 h-5 w-5 xl:h-6 xl:w-6" />
                      Create Event
                    </Link>
                  </Button>
                </div>
                
                {/* Enhanced Trust Indicators - Responsive Layout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 xl:space-x-8 pt-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs xl:text-sm font-semibold text-gray-600">+5K</span>
                      </div>
                    </div>
                    <span className="text-sm xl:text-base text-gray-500 font-medium">Active organizers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Icon key={i} name="Star" className="w-4 h-4 xl:w-5 xl:h-5 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm xl:text-base text-gray-500 font-medium ml-1">4.9/5 rating</span>
                  </div>
                </div>
              </div>
              
              {/* Visual Side - Responsive Dashboard */}
              <div className="relative animate-fade-in xl:col-span-2" style={{animationDelay: '0.2s'}}>
                <div className="relative scale-90 lg:scale-100 xl:scale-110 2xl:scale-125">
                  {/* Enhanced Dashboard Mockup */}
                  <div className="bg-white rounded-2xl xl:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-2 hover:rotate-1 transition-transform duration-500">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 xl:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Icon name="Calendar" className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                          </div>
                          <span className="text-white font-semibold text-sm xl:text-base">EventHub Dashboard</span>
                        </div>
                        <div className="w-3 h-3 xl:w-4 xl:h-4 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="p-6 xl:p-8 space-y-4 xl:space-y-6">
                      {/* Enhanced Stats Cards */}
                      <div className="grid grid-cols-2 gap-3 xl:gap-4">
                        <div className="bg-blue-50 rounded-lg xl:rounded-xl p-3 xl:p-4">
                          <div className="text-2xl xl:text-3xl font-bold text-blue-600">1,234</div>
                          <div className="text-xs xl:text-sm text-blue-500">Total Events</div>
                        </div>
                        <div className="bg-green-50 rounded-lg xl:rounded-xl p-3 xl:p-4">
                          <div className="text-2xl xl:text-3xl font-bold text-green-600">5,678</div>
                          <div className="text-xs xl:text-sm text-green-500">Attendees</div>
                        </div>
                      </div>
                      
                      {/* Enhanced Event List Preview */}
                      <div className="space-y-2 xl:space-y-3">
                        <div className="flex items-center space-x-3 p-2 xl:p-3 bg-gray-50 rounded-lg xl:rounded-xl">
                          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-blue-100 rounded xl:rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-2 xl:h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-1.5 xl:h-2 bg-gray-100 rounded w-1/2 mt-1 xl:mt-2"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-2 xl:p-3 bg-gray-50 rounded-lg xl:rounded-xl">
                          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-violet-100 rounded xl:rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-2 xl:h-3 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-1.5 xl:h-2 bg-gray-100 rounded w-1/3 mt-1 xl:mt-2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 xl:w-20 xl:h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl xl:rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                    <Icon name="TrendingUp" className="w-8 h-8 xl:w-10 xl:h-10 text-white" />
                  </div>
                  
                  <div className="absolute -bottom-6 -left-6 w-20 h-12 xl:w-24 xl:h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg xl:rounded-xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-3 transition-transform duration-300">
                    <Icon name="Users" className="w-6 h-6 xl:w-8 xl:h-8 text-white" />
                  </div>
                  
                  {/* Enhanced Notification Badge */}
                  <div className="absolute top-8 -left-4 bg-white rounded-lg xl:rounded-xl shadow-lg p-3 xl:p-4 border border-gray-100 transform -rotate-6 hover:-rotate-3 transition-transform duration-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 xl:w-3 xl:h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs xl:text-sm font-medium text-gray-700">New Registration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 xl:w-8 xl:h-12 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 xl:w-1.5 xl:h-4 bg-gray-400 rounded-full mt-2 xl:mt-3 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section - Large Screen Optimized */}
      <section className="py-20 xl:py-28 2xl:py-32 bg-white relative section-large-padding">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30"></div>
        <div className="relative container mx-auto px-4 xl:px-6 2xl:px-8">
          <div className="text-center mb-16 xl:mb-20 2xl:mb-24">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-4 xl:mb-6">Platform Statistics</h2>
            <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-600">See how our community is growing</p>
          </div>
          
          {/* Large Screen Optimized Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-12 2xl:gap-16 stats-large-layout">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <StatCard
                title="Total Events"
                value="1,234"
                change={{ value: 12, trend: 'up' }}
                icon="Calendar"
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover-lift card-large-screen"
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <StatCard
                title="Active Users"
                value="5,678"
                change={{ value: 8, trend: 'up' }}
                icon="Users"
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover-lift card-large-screen"
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <StatCard
                title="Categories"
                value="24"
                change={{ value: 0, trend: 'neutral' }}
                icon="Folder"
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover-lift card-large-screen"
              />
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <StatCard
                title="This Month"
                value="89"
                change={{ value: 15, trend: 'up' }}
                icon="TrendingUp"
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover-lift card-large-screen"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Events - Large Screen Grid */}
      <section className="py-20 xl:py-28 2xl:py-32 bg-gradient-to-br from-gray-50 to-blue-50/50 section-large-padding">
        <div className="container mx-auto px-4 xl:px-6 2xl:px-8">
          <div className="text-center mb-16 xl:mb-20 2xl:mb-24">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-4 xl:mb-6">Featured Events</h2>
            <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-600 max-w-3xl xl:max-w-4xl mx-auto">
              Don't miss these amazing upcoming events happening in your area
            </p>
          </div>

          {/* Large Screen Optimized Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 xl:gap-12 2xl:gap-16 events-large-grid events-4k-grid">
            {featuredEvents.map((event, index) => (
              <div key={event.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <Card className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift overflow-hidden group h-full card-large-screen">
                  <div className="relative overflow-hidden">
                    <img
                      src={event.primaryImageUrl}
                      alt={event.title}
                      className="w-full h-48 xl:h-56 2xl:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge className="absolute top-4 right-4 bg-white/90 text-gray-900 shadow-lg text-sm xl:text-base">
                      {event.remainingCapacity} spots left
                    </Badge>
                  </div>
                  <CardContent className="p-6 xl:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-sm xl:text-base">
                        {event.category}
                      </Badge>
                    </div>
                    <h3 className="text-xl xl:text-2xl font-semibold mb-3 group-hover:text-blue-600 transition-colors flex-shrink-0">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 xl:text-lg mb-4 line-clamp-3 flex-1">{event.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm xl:text-base text-gray-500">
                        <Icon name="Calendar" className="mr-2 h-4 w-4 xl:h-5 xl:w-5" />
                        {new Date(event.startDateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center text-sm xl:text-base text-gray-500">
                        <Icon name="MapPin" className="mr-2 h-4 w-4 xl:h-5 xl:w-5" />
                        {event.venue}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1 hover-lift xl:py-3" asChild>
                        <Link to={`/events/${event.id}`}>View Details</Link>
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 xl:py-3">
                        Register Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 xl:mt-20 2xl:mt-24">
            <Button variant="outline" size="lg" className="hover-lift shadow-md bg-white xl:px-12 xl:py-4 xl:text-lg" asChild>
              <Link to="/events">
                View All Events
                <Icon name="ArrowRight" className="ml-2 h-4 w-4 xl:h-5 xl:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section - Large Screen Grid */}
      <section className="py-20 xl:py-28 2xl:py-32 bg-white section-large-padding">
        <div className="container mx-auto px-4 xl:px-6 2xl:px-8">
          <div className="text-center mb-16 xl:mb-20 2xl:mb-24">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-4 xl:mb-6">Browse by Category</h2>
            <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-600">
              Find events that match your interests
            </p>
          </div>

          {/* Large Screen Optimized Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6 xl:gap-8 2xl:gap-10 categories-large-grid categories-4k-grid">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/events?category=${category.name.toLowerCase()}`}
                className="group animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <Card className="text-center hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 bg-white h-full card-large-screen">
                  <CardContent className="p-6 xl:p-8 2xl:p-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 rounded-2xl xl:rounded-3xl bg-gradient-to-br ${category.color} mb-4 xl:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={category.icon} className="h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 xl:text-lg 2xl:text-xl mb-1 xl:mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm xl:text-base text-gray-500">{category.count} events</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Large Screen Optimized */}
      <section className="py-20 xl:py-28 2xl:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden section-large-padding">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 xl:w-[32rem] xl:h-[32rem] 2xl:w-[40rem] 2xl:h-[40rem] bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 xl:w-96 xl:h-96 2xl:w-[30rem] 2xl:h-[30rem] bg-white/5 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 xl:px-6 2xl:px-8 text-center">
          <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white mb-6 xl:mb-8">
              Ready to Create Your Own Event?
            </h2>
            <p className="text-xl xl:text-2xl 2xl:text-3xl text-white/90 mb-10 xl:mb-12 max-w-4xl xl:max-w-5xl mx-auto">
              Join thousands of event organizers who trust EventHub to manage their events and connect with their audience
            </p>
            <div className="flex flex-col sm:flex-row gap-6 xl:gap-8 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover-lift xl:px-12 xl:py-6 xl:text-xl" asChild>
                <Link to="/events/create">
                  <Icon name="Plus" className="mr-2 h-5 w-5 xl:h-6 xl:w-6" />
                  Create Your Event
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm text-white hover-lift xl:px-12 xl:py-6 xl:text-xl" asChild>
                <Link to="/auth/register">
                  <Icon name="UserPlus" className="mr-2 h-5 w-5 xl:h-6 xl:w-6" />
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section - Large Screen Layout */}
      <section className="py-20 xl:py-28 2xl:py-32 bg-gray-50 section-large-padding">
        <div className="container mx-auto px-4 xl:px-6 2xl:px-8">
          <div className="text-center mb-16 xl:mb-20 2xl:mb-24">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-4 xl:mb-6">Why Choose EventHub?</h2>
            <p className="text-lg xl:text-xl 2xl:text-2xl text-gray-600 max-w-3xl xl:max-w-4xl mx-auto">
              Everything you need to create, manage, and promote successful events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12 2xl:gap-16 max-w-6xl xl:max-w-7xl mx-auto">
            <div className="text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 xl:mb-8">
                <Icon name="Zap" className="h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 text-white" />
              </div>
              <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold text-gray-900 mb-4 xl:mb-6">Easy Setup</h3>
              <p className="text-gray-600 xl:text-lg 2xl:text-xl leading-relaxed">
                Create and publish your event in minutes with our intuitive event builder and customization options.
              </p>
            </div>
            
            <div className="text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 xl:mb-8">
                <Icon name="Users" className="h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 text-white" />
              </div>
              <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold text-gray-900 mb-4 xl:mb-6">Reach More People</h3>
              <p className="text-gray-600 xl:text-lg 2xl:text-xl leading-relaxed">
                Connect with a larger audience through our platform and built-in marketing tools to maximize attendance.
              </p>
            </div>
            
            <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6 xl:mb-8">
                <Icon name="BarChart3" className="h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 text-white" />
              </div>
              <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold text-gray-900 mb-4 xl:mb-6">Powerful Analytics</h3>
              <p className="text-gray-600 xl:text-lg 2xl:text-xl leading-relaxed">
                Track your event performance with detailed analytics and insights to improve future events.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}