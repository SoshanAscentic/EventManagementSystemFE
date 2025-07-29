import { useMemo, useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'
import { setAuth, clearAuth, setLoading } from '@/app/slices/authSlice'
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
  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector((state: RootState) => state.auth)
  
  const { 
    data, 
    isLoading: queryLoading, 
    error,
    refetch 
  } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated || !authLoading, // Skip if already authenticated or not initially loading
  })

  // Update auth state when query succeeds
  useEffect(() => {
    if (data?.success && data.data && !isAuthenticated) {
      console.log('Setting auth from API response:', data.data)
      dispatch(setAuth(data.data))
    } else if (error && authLoading) {
      console.log('Auth query failed, clearing auth state')
      dispatch(clearAuth())
    }
  }, [data, error, dispatch, isAuthenticated, authLoading])

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

  const isLoading = authLoading || queryLoading

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
