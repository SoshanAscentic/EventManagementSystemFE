import { baseApi } from '@/app/api/baseApi'
import { UserDto } from '@/shared/types/domain'
import { ApiResponse } from '@/shared/types/api'
import { setAuth, clearAuth } from '@/app/slices/authSlice'

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  userId: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  roles: string[]
  accessToken: string
  refreshToken: string
  expiresAt: string
  isEmailConfirmed: boolean
}

// Token management utilities
const setTokenCookies = (authResponse: LoginResponse) => {
  // Set access token (expires when JWT expires)
  document.cookie = `accessToken=${authResponse.accessToken}; path=/; secure; samesite=lax; expires=${new Date(authResponse.expiresAt).toUTCString()}`;
  
  // Set refresh token (expires in 7 days)
  const refreshExpiry = new Date();
  refreshExpiry.setDate(refreshExpiry.getDate() + 7);
  document.cookie = `refreshToken=${authResponse.refreshToken}; path=/; secure; samesite=lax; expires=${refreshExpiry.toUTCString()}`;
  
  console.log('Tokens stored in cookies successfully');
};

const clearTokenCookies = () => {
  // Clear cookies by setting them to expire in the past
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  console.log('Tokens cleared from cookies');
};

export const getTokenFromCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled
          if (data.success && data.data) {
            // Store tokens in cookies
            setTokenCookies(data.data)
            
            // Map LoginResponse to UserDto format
            const userData: UserDto = {
              id: data.data.userId,
              email: data.data.email,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              roles: data.data.roles,
              isActive: true,
              createdAt: new Date().toISOString(),
            }
            dispatch(setAuth(userData))
            console.log('Login successful:', data.data)
          }
        } catch (error) {
          console.error('Login failed:', error)
          clearTokenCookies()
          dispatch(clearAuth())
        }
      },
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<ApiResponse<LoginResponse>, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled
          if (data.success && data.data) {
            // Store tokens in cookies for register
            setTokenCookies(data.data)
            
            const userData: UserDto = {
              id: data.data.userId,
              email: data.data.email,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              roles: data.data.roles,
              isActive: true,
              createdAt: new Date().toISOString(),
            }
            dispatch(setAuth(userData))
          }
        } catch (error) {
          console.error('Registration failed:', error)
          clearTokenCookies()
          dispatch(clearAuth())
        }
      },
      invalidatesTags: ['User'],
    }),
    
    getCurrentUser: builder.query<ApiResponse<LoginResponse>, void>({
      query: () => '/auth/me',
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled
          if (data.success && data.data) {
            const userData: UserDto = {
              id: data.data.userId,
              email: data.data.email,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              roles: data.data.roles,
              isActive: true,
              createdAt: new Date().toISOString(),
            }
            dispatch(setAuth(userData))
          } else {
            dispatch(clearAuth())
          }
        } catch (error) {
          clearTokenCookies()
          dispatch(clearAuth())
        }
      },
      providesTags: ['User'],
    }),
    
    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch }) {
        // Clear tokens and auth state immediately
        clearTokenCookies()
        dispatch(clearAuth())
      },
      invalidatesTags: ['User'],
    }),
    
    refreshToken: builder.mutation<ApiResponse<LoginResponse>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    
    changePassword: builder.mutation<ApiResponse<void>, ChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
} = authApi 