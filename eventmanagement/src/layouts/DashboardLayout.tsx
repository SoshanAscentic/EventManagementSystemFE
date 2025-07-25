import { Outlet } from 'react-router-dom'
import { useState } from 'react'
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

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'A'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {!sidebarCollapsed && (
              <Link to="/" className="flex items-center space-x-2">
                <div className="rounded-md bg-primary p-1">
                  <Icon name="Calendar" className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">EventHub Admin</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8"
            >
              <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-100',
                    sidebarCollapsed && 'justify-center'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="border-t p-4">
            <div className={cn(
              'flex items-center',
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            )}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
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
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}