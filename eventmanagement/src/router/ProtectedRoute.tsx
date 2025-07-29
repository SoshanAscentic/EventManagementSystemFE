import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'
import { useAuth } from '../shared/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  
  // Only call getCurrentUser if we're not authenticated
  const { refetch, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated, // Skip if already authenticated
  });

  useEffect(() => {
    // Try to verify auth if we're not authenticated and not already loading
    if (!isAuthenticated && !isLoading && !isFetching) {
      console.log('ProtectedRoute: Attempting to verify authentication...')
      refetch();
    }
  }, [isAuthenticated, isLoading, isFetching, refetch]);

  // Show loading screen during auth verification
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login')
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles && user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      console.log('ProtectedRoute: User lacks required roles:', requiredRoles, 'User roles:', user.roles)
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

export default ProtectedRoute; 