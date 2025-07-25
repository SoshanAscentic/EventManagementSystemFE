import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/atoms'

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <Icon name="Shield" className="mx-auto h-24 w-24 text-red-400 mb-4" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You don't have permission to access this resource. Please contact an administrator if you believe this is an error.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <Icon name="Home" className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/profile">
              <Icon name="User" className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}