import { useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'
import { setAuth } from '@/app/slices/authSlice'
import type { RootState } from '@/app/store'

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
  const { user, isAuthenticated, roles } = useAppSelector((state: RootState) => state.auth)
  
  const { data, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated,
  })

  // Update auth state when query succeeds
  useMemo(() => {
    if (data?.success && data.data.user && !isAuthenticated) {
      dispatch(setAuth({
        user: data.data.user,
        roles: data.data.roles,
      }))
    }
  }, [data, dispatch, isAuthenticated])

  const permissions = useMemo(() => getPermissions(roles), [roles])

  const hasRole = useCallback((role: string) => roles.includes(role), [roles])
  
  const hasAnyRole = useCallback((requiredRoles: string[]) => 
    requiredRoles.some(role => roles.includes(role)), [roles])
  
  const hasPermission = useCallback(
    (permission: keyof UserPermissions) => permissions[permission],
    [permissions]
  )

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
    isAdmin: hasRole('Admin'),
    isUser: hasRole('User'),
  }
}
