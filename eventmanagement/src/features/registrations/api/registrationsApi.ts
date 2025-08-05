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
  status: 'Registered' | 'Cancelled' | 'Attended'
  notes?: string
  attended?: boolean
  isActive: boolean
  canCancel: boolean
}

export interface MyRegistrationsParams extends PaginationParams {
  status?: string
  ascending?: boolean
}

// Transform frontend params to backend params with required Ascending
const transformRegistrationParams = (params: MyRegistrationsParams) => {
  const transformed: any = { ...params }
  
  // ALWAYS include Ascending parameter (required by backend)
  if ('ascending' in transformed) {
    transformed.Ascending = transformed.ascending
    delete transformed.ascending
  } else {
    // Default to false (newest first)
    transformed.Ascending = false
  }
  
  // Clean undefined values
  const cleaned: Record<string, any> = {}
  Object.entries(transformed).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value
    }
  })
  
  return cleaned
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
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Registration', id: 'LIST' },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: eventId }, // Invalidate the specific event
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    cancelRegistration: builder.mutation<ApiResponse<void>, CancelRegistrationRequest>({
      query: ({ registrationId, reason }) => ({
        url: `/registrations/${registrationId}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { registrationId }) => {
        // We need to find which event this registration belongs to
        // Since we don't have eventId in the request, we'll invalidate all events
        return [
          { type: 'Registration', id: 'LIST' },
          { type: 'Registration', id: registrationId },
          { type: 'Event', id: 'LIST' },
          { type: 'Event', id: 'UPCOMING' },
        ]
      },
    }),

    getMyRegistrations: builder.query<PagedResponse<RegistrationDto>, MyRegistrationsParams>({
      query: (params) => {
        // Ensure we always have default values for required parameters
        const defaultParams: MyRegistrationsParams = {
          pageNumber: 1,
          pageSize: 10,
          ascending: false, // Default to newest first
          ...params, // Override with provided params
        }
        
        return {
          url: '/registrations/my-registrations',
          params: transformRegistrationParams(defaultParams),
        }
      },
      providesTags: (result) =>
        result?.success
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Registration' as const, id })),
              { type: 'Registration', id: 'LIST' },
            ]
          : [{ type: 'Registration', id: 'LIST' }],
    }),

    // ===== ADMIN OPERATIONS =====

    getEventRegistrations: builder.query<PagedResponse<RegistrationDto>, { 
      eventId: number; 
      pageNumber?: number; 
      pageSize?: number; 
      status?: string;
      ascending?: boolean;
    }>({
      query: ({ eventId, ascending = false, ...params }) => {
        // Transform parameters for backend
        const transformedParams: any = {
          ...params,
          Ascending: ascending, // Always include required parameter
        }
        
        // Clean undefined values
        const cleaned: Record<string, any> = {}
        Object.entries(transformedParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value
          }
        })
        
        return {
          url: `/registrations/event/${eventId}`,
          params: cleaned,
        }
      },
      providesTags: (_result, _error, { eventId }) => [
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

export type { RegisterForEventRequest }