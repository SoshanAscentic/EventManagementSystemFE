import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { 
    label: 'Dashboard', 
    href: '/admin', 
    icon: 'BarChart3' as const,
    permissions: ['canAccessAdminPanel']
  },
  { 
    label: 'Events', 
    href: '/admin/events', 
    icon: 'Calendar' as const,
    permissions: ['canCreateEvents']
  },
  { 
    label: 'Categories', 
    href: '/admin/categories', 
    icon: 'Folder' as const,
    permissions: ['canManageCategories']
  },
  { 
    label: 'Registrations', 
    href: '/admin/registrations', 
    icon: 'Users' as const,
    permissions: ['canViewAllRegistrations']
  },
  { 
    label: 'Analytics', 
    href: '/admin/analytics', 
    icon: 'TrendingUp' as const,
    permissions: ['canViewAnalytics']
  },
  { 
    label: 'Users', 
    href: '/admin/users', 
    icon: 'UserCog' as const,
    permissions: ['canManageUsers']
  },
]

export const Sidebar = () => {
  const { hasPermission } = useAuth()
  const location = useLocation()
  
  const visibleItems = sidebarItems.filter(item => 
    item.permissions.every(permission => hasPermission(permission as any))
  )

  if (visibleItems.length === 0) return null
  
  return (
    <aside className="w-64 border-r bg-gray-50">
      <nav className="p-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon name={item.icon} size={20} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
