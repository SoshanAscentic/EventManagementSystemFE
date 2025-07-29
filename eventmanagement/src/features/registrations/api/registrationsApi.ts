import { baseApi } from '@/app/api/baseApi'
import { ApiResponse, PagedResponse, PaginationParams } from '@/shared/types/api'
import { RegisterForEventRequest, CancelRegistrationRequest, MarkAttendanceRequest } from '@/features/events/types'

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
  status: 'Active' | 'Cancelled' | 'Attended'
  notes?: string
  attended?: boolean
  isActive: boolean
  canCancel: boolean
}

export interface MyRegistrationsParams extends PaginationParams {
  status?: string
  ascending?: boolean  // Added required parameter
}

export const registrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== USER REGISTRATION OPERATIONS =====
    
    registerForEvent: builder.mutation<ApiResponse<any>, RegisterForEventRequest>({
      query: (data) => ({
        url: '/registrations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Registration', id: 'LIST' },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    cancelRegistration: builder.mutation<ApiResponse<void>, CancelRegistrationRequest>({
      query: ({ registrationId, reason }) => ({
        url: `/registrations/${registrationId}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: [
        { type: 'Registration', id: 'LIST' },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    getMyRegistrations: builder.query<PagedResponse<RegistrationDto>, MyRegistrationsParams>({
      query: (params) => {
        // Clean params and ensure required parameters are included
        const cleanedParams: Record<string, any> = {}
        
        // Always include required Ascending parameter (default to true)
        cleanedParams.Ascending = params.ascending !== undefined ? params.ascending : true
        
        // Include pagination params with correct casing
        if (params.pageNumber !== undefined) cleanedParams.pageNumber = params.pageNumber
        if (params.pageSize !== undefined) cleanedParams.pageSize = params.pageSize
        if (params.status !== undefined) cleanedParams.status = params.status
        
        return {
          url: '/registrations/my-registrations',
          params: cleanedParams,
        }
      },
      providesTags: [{ type: 'Registration', id: 'LIST' }],
    }),

    // ===== ADMIN OPERATIONS =====

    getEventRegistrations: builder.query<PagedResponse<RegistrationDto>, { 
      eventId: number; 
      pageNumber?: number; 
      pageSize?: number; 
      status?: string;
      ascending?: boolean;  // Added for consistency
    }>({
      query: ({ eventId, ascending = true, ...params }) => ({
        url: `/registrations/event/${eventId}`,
        params: {
          ...params,
          Ascending: ascending,  // Include required parameter
        },
      }),
      providesTags: (result, error, { eventId }) => [
        { type: 'Registration', id: `EVENT_${eventId}` }
      ],
    }),

    markAttendance: builder.mutation<ApiResponse<void>, MarkAttendanceRequest>({
      query: ({ registrationId, attended }) => ({
        url: `/registrations/${registrationId}/attendance`,
        method: 'PUT',
        body: { attended },
      }),
      invalidatesTags: [
        { type: 'Registration', id: 'LIST' },
        { type: 'Event', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useRegisterForEventMutation,
  useCancelRegistrationMutation,
  useGetMyRegistrationsQuery,
  useGetEventRegistrationsQuery,
  useMarkAttendanceMutation,
} = registrationsApi