import { baseApi } from '@/app/api/baseApi'
import { UserDto } from '@/shared/types/domain'
import { ApiResponse, PagedResponse } from '@/shared/types/api'

export interface UpdateUserProfileRequest {
  firstName: string
  lastName: string
  phone?: string
}

export interface GetUsersRequest {
  searchTerm?: string
  pageNumber?: number
  pageSize?: number
  ascending?: boolean
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== USER PROFILE OPERATIONS =====
 
    getProfile: builder.query<ApiResponse<UserDto>, void>({
      query: () => '/users/profile',
      providesTags: [{ type: 'User', id: 'PROFILE' }],
    }),

    updateProfile: builder.mutation<ApiResponse<void>, UpdateUserProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [
        { type: 'User', id: 'PROFILE' },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // ===== ADMIN USER MANAGEMENT =====

    getUsers: builder.query<ApiResponse<PagedResponse<UserDto>>, GetUsersRequest>({
      query: (params) => {
        const cleanedParams: Record<string, any> = {}
        if (params.searchTerm) cleanedParams.searchTerm = params.searchTerm
        if (params.pageNumber) cleanedParams.pageNumber = params.pageNumber
        if (params.pageSize) cleanedParams.pageSize = params.pageSize
        // Backend requires ascending parameter
        cleanedParams.ascending = params.ascending !== undefined ? params.ascending : true
        
        return {
          url: '/users',
          params: cleanedParams,
        }
      },
      providesTags: (result) => [
        { type: 'User', id: 'LIST' },
        ...(result?.data?.items || []).map(({ id }) => ({ type: 'User' as const, id })),
      ],
      // Add this to prevent caching issues
      serializeQueryArgs: ({ queryArgs }) => {
        const { searchTerm, pageNumber, pageSize, ascending } = queryArgs
        return { searchTerm: searchTerm || '', pageNumber, pageSize, ascending }
      },
    }),

    getUserById: builder.query<ApiResponse<UserDto>, number>({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
} = usersApi