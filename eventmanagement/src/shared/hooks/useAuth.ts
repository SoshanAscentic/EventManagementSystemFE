import { useMemo, useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'
import { setAuth, clearAuth } from '@/app/slices/authSlice'
import type { RootState } from '@/app/store/store'

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

export const getPermissions = (roles: string[]): UserPermissions => {
  const isAdmin = roles.includes('Admin')
  
  return {
    canViewEvents: true, // All users can view events
    canRegisterForEvents: true, // All users can register
    canCreateEvents: isAdmin,
    canEditEvents: isAdmin,
    canDeleteEvents: isAdmin,
    canManageCategories: isAdmin,
    canViewAllRegistrations: isAdmin,
    canManageUsers: isAdmin,
    canViewAnalytics: isAdmin,
    canAccessAdminPanel: isAdmin,
  }
}

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isLoading: authLoading, isInitialized } = useAppSelector((state: RootState) => state.auth)
  
  const { 
    data, 
    isLoading: queryLoading, 
    error,
    refetch 
  } = useGetCurrentUserQuery(undefined, {
    // Only skip if we already have a user OR if we've completed initialization
    skip: isAuthenticated || isInitialized,
    // Disable automatic refetching on focus to prevent infinite loading
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  // Update auth state when query succeeds
  useEffect(() => {
    if (data?.success && data.data && !isAuthenticated) {
      console.log('Setting auth from API response:', data.data)
      const userData = {
        id: data.data.userId,
        email: data.data.email,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        roles: data.data.roles,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      dispatch(setAuth(userData))
    } else if (error && !isAuthenticated && !isInitialized) {
      console.log('Auth query failed, clearing auth state')
      dispatch(clearAuth())
    }
  }, [data, error, dispatch, isAuthenticated, isInitialized])

  // Get roles from user object
  const roles = user?.roles || []
  const permissions = useMemo(() => getPermissions(roles), [roles])

  const hasRole = useCallback((role: string) => roles.includes(role), [roles])
  
  const hasAnyRole = useCallback((requiredRoles: string[]) => 
    requiredRoles.some(role => roles.includes(role)), [roles])
  
  const hasPermission = useCallback(
    (permission: keyof UserPermissions) => permissions[permission],
    [permissions]
  )

  // Show loading during initial auth check OR during any auth-related API calls
  const isLoading = (!isInitialized && (authLoading || queryLoading)) || 
                  (isInitialized && queryLoading && !isAuthenticated)

  return {
    user,
    roles,
    permissions,
    hasRole,
    hasAnyRole,
    hasPermission,
    isAuthenticated: !!user,
    isLoading,
    error,
    refetch,
    isAdmin: hasRole('Admin'),
    isUser: hasRole('User'),
  }
}
