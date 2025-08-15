import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage, Badge, Icon } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'
import { useLogoutMutation } from '@/features/auth/api/authApi'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearAuth } from '@/app/slices/authSlice'
import { PermissionGuard } from '@/shared/components/PermissionGaurd' 
import { cn } from '@/lib/utils'
import { NotificationPanel } from '@/features/notifications/components/NotificationPanel'

export interface HeaderProps {
  className?: string
}

export const Header = ({ className }: HeaderProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAuth()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { unreadCount } = useAppSelector(state => state.notifications)

  const navigationItems = [
    { label: 'Events', href: '/events', icon: 'Calendar' as const },
    { label: 'Categories', href: '/categories', icon: 'Folder' as const },
  ]

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'

  const handleLogout = async () => {
    try {
      dispatch(clearAuth())
      await logout().unwrap()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      dispatch(clearAuth())
      navigate('/auth/login')
    }
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300',
      className
    )}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
          >
            <div className="relative rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/25">
              <Icon name="Calendar" className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:to-purple-600">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group relative flex items-center space-x-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-blue-600 hover:shadow-md"
              >
                <Icon name={item.icon} className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative">
                  {item.label}
                  <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            ))}
            
            {/* Admin Panel */}
            <PermissionGuard permissions={['canAccessAdminPanel']}>
              <>
                <div className="mx-2 h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                <Link
                  to="/admin"
                  className="group relative flex items-center space-x-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-all duration-300 hover:from-amber-100 hover:to-orange-100 hover:shadow-md hover:shadow-amber-500/25"
                >
                  <Icon name="Settings" className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span>Admin</span>
                </Link>
              </>
            </PermissionGuard>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-500/25"
                    >
                      <Icon name="Bell" className="h-5 w-5 text-gray-600 transition-colors duration-300 hover:text-blue-600" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-white font-bold shadow-lg"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-96 p-0 border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-xl"
                  >
                    <NotificationPanel />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="group relative h-11 w-11 rounded-full p-0 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      <Avatar className="h-10 w-10 border-2 border-white shadow-md transition-all duration-300 group-hover:border-blue-200 group-hover:scale-105">
                        <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-64 border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-xl" 
                    align="end"
                  >
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 border-2 border-blue-100">
                            <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user?.roles.map((role: string) => (
                            <Badge key={role} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200/50" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="group cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                    >
                      <Icon name="User" className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-blue-600" />
                      <span className="font-medium">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/registrations')}
                      className="group cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-green-50"
                    >
                      <Icon name="Ticket" className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-green-600" />
                      <span className="font-medium">My Registrations</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile/settings')}
                      className="group cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-purple-50"
                    >
                      <Icon name="Settings" className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-purple-600" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    
                    <PermissionGuard permissions={['canAccessAdminPanel']}>
                      <>
                        <DropdownMenuSeparator className="bg-gray-200/50" />
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin')}
                          className="group cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-amber-50"
                        >
                          <Icon name="Shield" className="mr-3 h-4 w-4 text-amber-600 transition-colors duration-200 group-hover:text-amber-700" />
                          <span className="font-medium text-amber-700">Admin Dashboard</span>
                        </DropdownMenuItem>
                      </>
                    </PermissionGuard>
                    
                    <DropdownMenuSeparator className="bg-gray-200/50" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      disabled={isLoggingOut}
                      className="group cursor-pointer px-4 py-3 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Icon name="LogOut" className="mr-3 h-4 w-4 text-gray-500 transition-colors duration-200 group-hover:text-red-600" />
                      <span className="font-medium group-hover:text-red-700">
                        {isLoggingOut ? 'Logging out...' : 'Log out'}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth/login')}
                  className="rounded-lg font-medium transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth/register')}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-medium shadow-lg text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon 
                name={mobileMenuOpen ? "X" : "Menu"} 
                className="h-5 w-5 transition-transform duration-300" 
              />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out md:hidden',
          mobileMenuOpen ? 'max-h-96 border-t border-gray-200/50' : 'max-h-0'
        )}>
          <div className="space-y-1 bg-white/50 backdrop-blur-sm px-3 pb-4 pt-3">
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'group flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md',
                  'transform translate-x-0 opacity-100',
                  !mobileMenuOpen && 'translate-x-4 opacity-0'
                )}
                style={{ 
                  transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms' 
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name={item.icon} className="h-5 w-5 transition-colors duration-300 group-hover:text-blue-600" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <PermissionGuard permissions={['canAccessAdminPanel']}>
              <div className="mx-4 my-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <Link
                to="/admin"
                className="group flex items-center space-x-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-medium text-amber-700 transition-all duration-300 hover:from-amber-100 hover:to-orange-100 hover:shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="Settings" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                <span>Admin Panel</span>
              </Link>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </header>
  )
}