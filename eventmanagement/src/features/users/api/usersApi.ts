import { baseApi } from '@/app/api/baseApi'
import { UserDto } from '@/shared/types/domain'
import { ApiResponse, PagedResponse } from '@/shared/types/api'

export interface UpdateUserProfileRequest {
  firstName: string
  lastName: string
  phone?: string
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

    getUsers: builder.query<PagedResponse<UserDto>, {
      searchTerm?: string;
      pageNumber?: number;
      pageSize?: number;
    }>({
      query: (params) => {
        const cleanedParams: Record<string, any> = {}
        if (params.searchTerm) cleanedParams.searchTerm = params.searchTerm
        if (params.pageNumber) cleanedParams.pageNumber = params.pageNumber
        if (params.pageSize) cleanedParams.pageSize = params.pageSize
        
        return {
          url: '/users',
          params: cleanedParams,
        }
      },
      providesTags: [{ type: 'User', id: 'LIST' }],
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