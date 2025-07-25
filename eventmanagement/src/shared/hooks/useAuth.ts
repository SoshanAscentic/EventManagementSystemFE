import { useAppSelector } from '@/app/hooks'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'

export const useAuth = () => {
  const { user, isAuthenticated, roles } = useAppSelector(state => state.auth)
  const { data, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated, // Skip if already authenticated
  })

  return {
    user,
    isAuthenticated,
    roles,
    isLoading,
    error,
    isAdmin: roles.includes('Admin'),
    isModerator: roles.includes('Moderator'),
  }
}