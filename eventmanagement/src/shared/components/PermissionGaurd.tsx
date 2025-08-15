import { useAuth } from '@/shared/hooks/useAuth'

interface UserPermissions {
  canViewEvents: boolean
  canRegisterForEvents: boolean
  canCreateEvents: boolean
  canEditEvents: boolean
  canDeleteEvents: boolean
  canManageCategories: boolean
  canViewAllRegistrations: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canAccessAdminPanel: boolean
}

interface PermissionGuardProps {
  children: React.ReactNode
  roles?: string[]
  permissions?: (keyof UserPermissions)[]
  fallback?: React.ReactNode
  requireAll?: boolean
}

export const PermissionGuard = ({ 
  children, 
  roles = [], 
  permissions = [],
  fallback = null,
  requireAll = false 
}: PermissionGuardProps) => {
  const { hasAnyRole, hasPermission, isAuthenticated } = useAuth()
  
  // If not authenticated, hide by default unless explicitly showing fallback
  if (!isAuthenticated) {
    return <>{fallback}</>
  }
  
  // Check roles
  const hasRequiredRoles = roles.length === 0 || hasAnyRole(roles)
  
  // Check permissions
  const hasRequiredPermissions = permissions.length === 0 || 
    (requireAll 
      ? permissions.every(p => hasPermission(p))
      : permissions.some(p => hasPermission(p))
    )
  
  const hasAccess = hasRequiredRoles && hasRequiredPermissions
  
  return hasAccess ? <>{children}</> : <>{fallback}</>
}

export type { UserPermissions }