import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store/store'
import { clearAuth, setLoading } from '../slices/authSlice'
import { getTokenFromCookie } from '@/features/auth/api/authApi'

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://localhost:7026/api', 
  mode: 'cors',
  prepareHeaders: (headers, { endpoint }) => {
    // DON'T set Content-Type for file uploads - let browser handle it
    const isFileUpload = endpoint === 'uploadEventImage' || 
                        (endpoint && typeof endpoint === 'string' && endpoint.includes('upload'))
    
    if (!isFileUpload) {
      headers.set('Content-Type', 'application/json')
    }
    headers.set('Accept', 'application/json')
    
    // Add Authorization header with token from cookie
    const token = getTokenFromCookie('accessToken')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  // Set loading state
  api.dispatch(setLoading(true))
  
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // Only attempt refresh if this isn't already a refresh request
    const isRefreshRequest = typeof args === 'object' && args.url === '/auth/refresh'
    const isAuthMeRequest = (typeof args === 'string' && args === '/auth/me') || 
                           (typeof args === 'object' && args.url === '/auth/me')
    
    if (!isRefreshRequest && !isAuthMeRequest) {
      console.log('401 error, attempting token refresh...')
      
      // Get refresh token from cookie
      const refreshToken = getTokenFromCookie('refreshToken')
      
      if (refreshToken) {
        // Try to refresh token
        const refreshResult = await baseQuery({
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        }, api, extraOptions)
        
        if (refreshResult.data && (refreshResult.data as any).success) {
          console.log('Token refresh successful')
          
          // Store new tokens
          const newTokens = (refreshResult.data as any).data
          document.cookie = `accessToken=${newTokens.accessToken}; path=/; secure; samesite=lax; expires=${new Date(newTokens.expiresAt).toUTCString()}`
          
          const refreshExpiry = new Date()
          refreshExpiry.setDate(refreshExpiry.getDate() + 7)
          document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; secure; samesite=lax; expires=${refreshExpiry.toUTCString()}`
          
          // Retry original request
          result = await baseQuery(args, api, extraOptions)
        } else {
          console.log('Token refresh failed, clearing auth')
          // Clear tokens
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
          api.dispatch(clearAuth())
          
          // Only redirect if not already on auth pages
          const currentPath = window.location.pathname
          if (!currentPath.startsWith('/auth') && !currentPath.startsWith('/login')) {
            window.location.href = '/auth/login'
          }
        }
      } else {
        console.log('No refresh token available, clearing auth')
        api.dispatch(clearAuth())
      }
    } else {
      // For /auth/me or refresh requests that fail, just clear auth without retry
      console.log('Auth verification failed - user not authenticated')
      // Clear tokens
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
      api.dispatch(clearAuth())
    }
  }
  
  // Clear loading state
  api.dispatch(setLoading(false))
  
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Event', 
    'Category', 
    'Registration', 
    'User', 
    'Profile',
    'Statistics',
    'Notification',
    'Activity'
  ],
  endpoints: () => ({}),
})

