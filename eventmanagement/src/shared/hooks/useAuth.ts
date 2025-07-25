import { useAppSelector } from '@/app/hooks'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'
import { RootState } from '@/app/store' // Import RootState type

export const useAuth = () => {
  const { user, isAuthenticated, roles } = useAppSelector((state: RootState) => state.auth)
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