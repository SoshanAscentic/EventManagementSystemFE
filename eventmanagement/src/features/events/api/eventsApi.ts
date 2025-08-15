import { baseApi } from '@/app/api/baseApi'
import { EventDto, CategoryDto } from '@/shared/types/domain'
import { ApiResponse, PagedResponse } from '@/shared/types/api'
import {
  CreateEventRequest,
  UpdateEventRequest,
  EventsQueryParams,
  UpcomingEventsParams,
  UploadImageRequest,
  SetImagePrimaryRequest,
  DeleteImageRequest,
  UpdateEventCapacityRequest,
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

// Transform frontend params to backend params with required Ascending
const transformQueryParams = (params: EventsQueryParams) => {
  const transformed = { ...params }
  
  // ALWAYS include Ascending parameter (required by backend)
  if ('ascending' in transformed) {
    // @ts-ignore - we know this transformation is needed
    transformed.Ascending = transformed.ascending
    delete transformed.ascending
  } else if (transformed.Ascending === undefined) {
    // Default to true if not provided (ascending order)
    transformed.Ascending = true
  }
  
  return cleanParams(transformed)
}

// ===== EVENTS API ENDPOINTS =====

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== READ OPERATIONS =====
    
    getEvents: builder.query<PagedResponse<EventDto>, EventsQueryParams>({
      query: (params) => {
        // Ensure we always have default values for required parameters
        const defaultParams: EventsQueryParams = {
          pageNumber: 1,
          pageSize: 6,
          Ascending: true, // Default to ascending
          ...params, // Override with provided params
        }
        
        console.log('Events API Query Params:', defaultParams) // Debug log
        
        return {
          url: '/events',
          params: transformQueryParams(defaultParams),
        }
      },
      // Fix caching issue - use the query params as part of the cache key
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        return `${endpointName}(${JSON.stringify(queryArgs)})`
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
      providesTags: (_result, _error, id) => [{ type: 'Event', id }],
    }),

    getUpcomingEvents: builder.query<ApiResponse<EventDto[]>, UpcomingEventsParams>({
      query: (params) => ({
        url: '/events/upcoming',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Event', id: 'UPCOMING' }],
    }),

    // ===== CREATE/UPDATE/DELETE OPERATIONS (Admin only) =====

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
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    updateEventCapacity: builder.mutation<ApiResponse<void>, UpdateEventCapacityRequest>({
      query: ({ id, newCapacity }) => ({
        url: `/events/${id}/capacity`,
        method: 'PUT',
        body: { newCapacity },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    deleteEvent: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => ({
        success: response.isSuccess,
        data: response.data,
        message: response.message,
        errors: response.errors
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),
    
    // ===== IMAGE MANAGEMENT (Admin only) =====

    uploadEventImage: builder.mutation<ApiResponse<any>, UploadImageRequest>({
      query: ({ eventId, file, isPrimary }) => {
        console.log('🚀 Upload mutation called:', { 
          eventId, 
          fileName: file.name, 
          fileSize: file.size, 
          fileType: file.type,
          isPrimary 
        })
        
        const formData = new FormData()
        formData.append('file', file)
        
        console.log('📦 FormData created with file:', formData.get('file'))
        
        return {
          url: `/events/${eventId}/images?isPrimary=${isPrimary}`,
          method: 'POST',
          body: formData,
        }
      },
      // Transform the response to match your frontend expectations
      transformResponse: (response: any) => {
        // Convert backend isSuccess to frontend success
        return {
          success: response.isSuccess,
          data: response.data,
          message: response.message,
          errors: response.errors
        }
      },
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
      ],
    }),
    
    setImageAsPrimary: builder.mutation<ApiResponse<void>, SetImagePrimaryRequest>({
      query: ({ eventId, imageId }) => ({
        url: `/events/${eventId}/images/${imageId}/primary`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => ({
        success: response.isSuccess,
        data: response.data,
        message: response.message,
        errors: response.errors
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
      ],
    }),
    
    deleteEventImage: builder.mutation<ApiResponse<void>, DeleteImageRequest>({
      query: ({ eventId, imageId }) => ({
        url: `/events/${eventId}/images/${imageId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => ({
        success: response.isSuccess,
        data: response.data,
        message: response.message,
        errors: response.errors
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
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

