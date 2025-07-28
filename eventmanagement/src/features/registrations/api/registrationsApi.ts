import { baseApi } from '@/app/api/baseApi'
import { ApiResponse, PagedResponse, PaginationParams } from '@/shared/types/api'

export interface RegistrationDto {
  id: number
  eventId: number
  userId: number
  eventTitle: string
  eventStartDateTime: string
  eventEndDateTime: string
  venue: string
  userName: string
  userEmail: string
  registeredAt: string
  cancelledAt?: string
  status: 'Active' | 'Cancelled' | 'Waitlist' | 'CheckedIn'
  notes?: string
  isActive: boolean
  canCancel: boolean
}

export interface MyRegistrationsParams extends PaginationParams {
  status?: string
  upcoming?: boolean
  past?: boolean
}

export const registrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyRegistrations: builder.query<PagedResponse<RegistrationDto>, MyRegistrationsParams>({
      query: (params) => ({
        url: '/registrations/my-registrations',
        params,
      }),
      providesTags: [{ type: 'Registration', id: 'LIST' }],
    }),

    getRegistrationById: builder.query<ApiResponse<RegistrationDto>, number>({
      query: (id) => `/registrations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Registration', id }],
    }),

    cancelRegistration: builder.mutation<ApiResponse<void>, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/registrations/${id}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: [
        { type: 'Registration', id: 'LIST' },
        { type: 'Event', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetMyRegistrationsQuery,
  useGetRegistrationByIdQuery,
  useCancelRegistrationMutation,
} = registrationsApi