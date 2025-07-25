import { Outlet, Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/atoms'
import { useAuth } from '@/shared/hooks/useAuth'

export const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
          <div className="rounded-md bg-primary p-2">
            <Icon name="Calendar" className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-gray-900">EventHub</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Outlet />
      </div>

      <div className="mt-8 text-center">
        <Link 
          to="/" 
          className="text-sm text-gray-600 hover:text-primary transition-colors"
        >
          ← Back to EventHub
        </Link>
      </div>
    </div>
  )
}