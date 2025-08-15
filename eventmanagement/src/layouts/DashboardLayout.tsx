import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Icon, Avatar, AvatarFallback, AvatarImage } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: 'BarChart3' as const,
  },
  {
    label: 'Events',
    href: '/admin/events',
    icon: 'Calendar' as const,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: 'Users' as const,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: 'Folder' as const,
  },
]

export const DashboardLayout = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'A'

  // Check if we're on mobile and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      // On mobile, always start collapsed
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true)
    }
  }, [location.pathname, isMobile])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay with Blur Effect */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300',
        // Mobile: overlay style, desktop: normal sidebar
        isMobile ? (
          sidebarCollapsed 
            ? '-translate-x-full w-64' 
            : 'translate-x-0 w-64'
        ) : (
          sidebarCollapsed ? 'w-16' : 'w-64'
        )
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 border-b bg-white">
            {(!sidebarCollapsed || isMobile) && (
              <Link to="/" className="flex items-center space-x-2 min-w-0">
                <div className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5">
                  <Icon name="Calendar" className="h-4 w-4 text-white" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  EventHub Admin
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-gray-100 shrink-0"
            >
              <Icon 
                name={
                  isMobile 
                    ? "X" 
                    : sidebarCollapsed 
                      ? "ChevronRight" 
                      : "ChevronLeft"
                } 
                className="h-4 w-4" 
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href !== '/admin' && location.pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    sidebarCollapsed && !isMobile && 'justify-center space-x-0'
                  )}
                  title={sidebarCollapsed && !isMobile ? item.label : undefined}
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="border-t bg-gray-50 p-3 sm:p-4">
            <div className={cn(
              'flex items-center',
              sidebarCollapsed && !isMobile ? 'justify-center' : 'space-x-3'
            )}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {(!sidebarCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Administrator</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        // Mobile: always full width, Desktop: respect sidebar state
        isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')
      )}>
        {/* Mobile Menu Button - Positioned within main content to avoid overlay */}
        {isMobile && sidebarCollapsed && (
          <div className="lg:hidden p-4 pb-0">
            <Button
              onClick={toggleSidebar}
              className="bg-white shadow-lg hover:bg-gray-50 text-gray-900 border border-gray-200"
              size="icon"
            >
              <Icon name="Menu" className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <div className={cn(
          "p-4 sm:p-6 lg:p-8",
          // Add top padding on mobile when menu button is shown
          isMobile && sidebarCollapsed && "pt-0"
        )}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}