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
  const { user, isAuthenticated, hasPermission } = useAuth()
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
      // First clear the UI state
      dispatch(clearAuth())
      
      // Then call the logout API (this will clear cookies)
      await logout().unwrap()
      
      // Navigate to login
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if API fails, ensure we clear local state and redirect
      dispatch(clearAuth())
      navigate('/auth/login')
    }
  }

  return (
    <header className={cn('border-b bg-white shadow-sm', className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="rounded-md bg-primary p-2">
              <Icon name="Calendar" className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Admin Panel - Only for users with admin permissions */}
            <PermissionGuard permissions={['canAccessAdminPanel']}>
              <>
                <div className="h-4 w-px bg-gray-300" />
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  <Icon name="Settings" className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </>
            </PermissionGuard>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Icon name="Bell" className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-96 p-0">
                    <NotificationPanel />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {user?.roles.map((role: string) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Icon name="User" className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/registrations')}>
                      <Icon name="Ticket" className="mr-2 h-4 w-4" />
                      My Registrations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
                      <Icon name="Settings" className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    
                    {/* Admin Dashboard Link */}
                    <PermissionGuard permissions={['canAccessAdminPanel']}>
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Icon name="Shield" className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    </PermissionGuard>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                      <Icon name="LogOut" className="mr-2 h-4 w-4" />
                      {isLoggingOut ? 'Logging out...' : 'Log out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth/register')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <PermissionGuard permissions={['canAccessAdminPanel']}>
                <>
                  <div className="h-px bg-gray-200 my-2" />
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Settings" className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </>
              </PermissionGuard>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}