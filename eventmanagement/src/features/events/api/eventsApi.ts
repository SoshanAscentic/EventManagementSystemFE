import { baseApi } from '@/app/api/baseApi'
import { EventDto, CategoryDto } from '@/shared/types/domain'
import { ApiResponse, PagedResponse } from '@/shared/types/api'
import {
  CreateEventRequest,
  UpdateEventRequest,
  UpdateCapacityRequest,
  EventsQueryParams,
  UpcomingEventsParams,
  RegisterForEventRequest,
  CancelRegistrationRequest,
  UploadImageRequest,
  MarkAttendanceRequest,
} from '../types'

// ===== UTILITY FUNCTIONS =====

const cleanParams = (params: Record<string, any>) => {
  const cleaned: Record<string, any> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = value
      } else if (!Array.isArray(value)) {
        cleaned[key] = value
      }
    }
  })
  return cleaned
}

// ===== EVENTS API ENDPOINTS =====

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== READ OPERATIONS =====
    
    getEvents: builder.query<PagedResponse<EventDto>, EventsQueryParams>({
      query: (params) => {
        const cleanedParams = cleanParams(params)
        // Ensure Ascending parameter is always present with a default value
        if (cleanedParams.Ascending === undefined) {
          cleanedParams.Ascending = true // Default to ascending order
        }
        
        return {
          url: '/events',
          params: cleanedParams,
        }
      },
      providesTags: (result) =>
        result?.success
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Event' as const, id })),
              { type: 'Event', id: 'LIST' },
            ]
          : [{ type: 'Event', id: 'LIST' }],
    }),

    getEventById: builder.query<ApiResponse<EventDto>, number>({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),

    getUpcomingEvents: builder.query<ApiResponse<EventDto[]>, UpcomingEventsParams>({
      query: (params) => ({
        url: '/events/upcoming',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Event', id: 'UPCOMING' }],
    }),

    // ===== CREATE/UPDATE/DELETE OPERATIONS =====

    createEvent: builder.mutation<ApiResponse<EventDto>, CreateEventRequest>({
      query: (eventData) => ({
        url: '/events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: [
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    updateEvent: builder.mutation<ApiResponse<void>, UpdateEventRequest>({
      query: ({ id, ...data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    updateEventCapacity: builder.mutation<ApiResponse<void>, UpdateCapacityRequest>({
      query: ({ id, newCapacity }) => ({
        url: `/events/${id}/capacity`,
        method: 'PUT',
        body: { newCapacity },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    deleteEvent: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    // ===== IMAGE MANAGEMENT =====

    uploadEventImage: builder.mutation<ApiResponse<any>, UploadImageRequest>({
      query: ({ eventId, file, isPrimary }) => {
        const formData = new FormData()
        formData.append('file', file)
        
        return {
          url: `/events/${eventId}/images?isPrimary=${isPrimary}`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    setImageAsPrimary: builder.mutation<ApiResponse<void>, { eventId: number; imageId: number }>({
      query: ({ eventId, imageId }) => ({
        url: `/events/${eventId}/images/${imageId}/primary`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    deleteEventImage: builder.mutation<ApiResponse<void>, { eventId: number; imageId: number }>({
      query: ({ eventId, imageId }) => ({
        url: `/events/${eventId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    // ===== CATEGORIES =====

    getCategories: builder.query<ApiResponse<CategoryDto[]>, { activeOnly?: boolean }>({
      query: (params) => ({
        url: '/categories',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
})

// ===== EXPORTED HOOKS =====

export const {
  // Read operations
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetUpcomingEventsQuery,
  
  // Create/Update/Delete operations
  useCreateEventMutation,
  useUpdateEventMutation,
  useUpdateEventCapacityMutation,
  useDeleteEventMutation,
  
  // Image management
  useUploadEventImageMutation,
  useSetImageAsPrimaryMutation,
  useDeleteEventImageMutation,
  
  // Categories
  useGetCategoriesQuery,
} = eventsApi