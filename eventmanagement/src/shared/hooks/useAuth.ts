import { useMemo, useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'
import { setAuth, clearAuth, setLoading, setInitialized } from '@/app/slices/authSlice'
import type { RootState } from '@/app/store/store'
import { getTokenFromCookie } from '@/features/auth/api/authApi'
import { selectUserInfo } from '@/app/slices/authSlice'

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
  const { user, isAuthenticated, isLoading: authIsLoading, isInitialized } = useAppSelector(selectUserInfo)
  
  // Check if we have tokens in cookies
  const hasTokens = getTokenFromCookie('accessToken') !== null
  
  // Only call getCurrentUser if we have tokens and haven't initialized yet
  const { data, error, isLoading: queryLoading } = useGetCurrentUserQuery(undefined, {
    skip: !hasTokens || isInitialized
  })

  useEffect(() => {
    // If no tokens exist, mark as initialized immediately
    if (!hasTokens && !isInitialized) {
      dispatch(setInitialized(true))
    }
  }, [hasTokens, isInitialized, dispatch])

  // Handle query completion
  useEffect(() => {
    if (hasTokens && (data || error)) {
      dispatch(setInitialized(true))
    }
  }, [data, error, hasTokens, dispatch])

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

  return {
    user,
    roles,
    permissions,
    hasRole,
    hasAnyRole,
    hasPermission,
    isAuthenticated: !!user,
    isLoading: authIsLoading || queryLoading,
    isInitialized,
    isAdmin: hasRole('Admin'),
    isUser: hasRole('User'),
  }
}