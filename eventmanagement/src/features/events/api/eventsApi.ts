import { baseApi } from '@/app/api/baseApi'
import { EventDto, CategoryDto } from '@/shared/types/domain'
import { ApiResponse, PagedResponse } from '@/shared/types/api'
import {
  CreateEventRequest,
  UpdateEventRequest,
  EventsQueryParams,
  UpcomingEventsParams,
  RegisterForEventRequest,
  UploadImageRequest,
  EventImageDto,
  EventStatisticsDto,
  EventAnalyticsDto,
  EventShareLinksDto,
  BulkUpdateRequest,
  ExportRequest,
  RegistrationUpdateRequest,
  CancelRegistrationRequest,
  TrackViewRequest,
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
      query: (params) => ({
        url: '/events',
        params: cleanParams(params),
      }),
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

    getFeaturedEvents: builder.query<ApiResponse<EventDto[]>, void>({
      query: () => '/events/featured',
      providesTags: [{ type: 'Event', id: 'FEATURED' }],
    }),

    searchEvents: builder.query<PagedResponse<EventDto>, EventsQueryParams>({
      query: (params) => ({
        url: '/events/search',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Event', id: 'SEARCH' }],
    }),

    getEventsByCategory: builder.query<PagedResponse<EventDto>, { categoryId: number; pageNumber?: number; pageSize?: number }>({
      query: ({ categoryId, ...params }) => ({
        url: `/events/category/${categoryId}`,
        params: cleanParams(params),
      }),
      providesTags: (result, error, { categoryId }) => [
        { type: 'Event', id: `CATEGORY_${categoryId}` }
      ],
    }),

    getRelatedEvents: builder.query<ApiResponse<EventDto[]>, { eventId: number; limit?: number }>({
      query: ({ eventId, limit = 3 }) => ({
        url: `/events/${eventId}/related`,
        params: { limit },
      }),
      providesTags: (result, error, { eventId }) => [
        { type: 'Event', id: `RELATED_${eventId}` }
      ],
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
        { type: 'Event', id: 'FEATURED' },
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
        { type: 'Event', id: 'FEATURED' },
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
        { type: 'Event', id: 'FEATURED' },
      ],
    }),

    duplicateEvent: builder.mutation<ApiResponse<EventDto>, number>({
      query: (id) => ({
        url: `/events/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),

    // ===== IMAGE MANAGEMENT =====

    uploadEventImage: builder.mutation<ApiResponse<EventImageDto>, UploadImageRequest>({
      query: ({ eventId, file, isPrimary, altText }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('isPrimary', isPrimary.toString())
        if (altText) formData.append('altText', altText)
        
        return {
          url: `/events/${eventId}/images`,
          method: 'POST',
          body: formData,
        }
      },
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

    updateEventImage: builder.mutation<ApiResponse<void>, { eventId: number; imageId: number; altText?: string; isPrimary?: boolean }>({
      query: ({ eventId, imageId, ...data }) => ({
        url: `/events/${eventId}/images/${imageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    // ===== REGISTRATION OPERATIONS =====

    registerForEvent: builder.mutation<ApiResponse<number>, RegisterForEventRequest>({
      query: (data) => ({
        url: '/registrations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'Registration', id: 'LIST' },
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    cancelEventRegistration: builder.mutation<ApiResponse<void>, CancelRegistrationRequest>({
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

    getEventRegistrations: builder.query<PagedResponse<any>, { eventId: number; pageNumber?: number; pageSize?: number }>({
      query: ({ eventId, ...params }) => ({
        url: `/registrations/event/${eventId}`,
        params: cleanParams(params),
      }),
      providesTags: (result, error, { eventId }) => [
        { type: 'Registration', id: `EVENT_${eventId}` }
      ],
    }),

    updateRegistrationStatus: builder.mutation<ApiResponse<void>, RegistrationUpdateRequest>({
      query: ({ registrationId, status, notes }) => ({
        url: `/registrations/${registrationId}/status`,
        method: 'PUT',
        body: { status, notes },
      }),
      invalidatesTags: [
        { type: 'Registration', id: 'LIST' },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    // ===== ADMIN OPERATIONS =====

    getEventStatistics: builder.query<ApiResponse<EventStatisticsDto>, { fromDate?: string; toDate?: string }>({
      query: (params) => ({
        url: '/admin/events/statistics',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Statistics', id: 'EVENTS' }],
    }),

    getCapacityAlerts: builder.query<ApiResponse<EventDto[]>, { threshold?: number }>({
      query: (params) => ({
        url: '/admin/events/capacity-alerts',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Event', id: 'CAPACITY_ALERTS' }],
    }),

    bulkUpdateEvents: builder.mutation<ApiResponse<void>, BulkUpdateRequest>({
      query: (data) => ({
        url: '/admin/events/bulk-update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    exportEvents: builder.mutation<Blob, ExportRequest>({
      query: ({ format, filters }) => ({
        url: `/admin/events/export`,
        method: 'POST',
        body: { format, filters: cleanParams(filters || {}) },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ===== EVENT PUBLISHING =====

    publishEvent: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/events/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    unpublishEvent: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/events/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Event', id: 'UPCOMING' },
      ],
    }),

    // ===== EVENT CATEGORIES =====

    getCategories: builder.query<ApiResponse<CategoryDto[]>, { activeOnly?: boolean }>({
      query: (params) => ({
        url: '/categories',
        params: cleanParams(params),
      }),
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    // ===== EVENT ANALYTICS =====

    getEventAnalytics: builder.query<ApiResponse<EventAnalyticsDto>, { eventId: number; period?: string }>({
      query: ({ eventId, period = '30d' }) => ({
        url: `/events/${eventId}/analytics`,
        params: { period },
      }),
      providesTags: (result, error, { eventId }) => [
        { type: 'Analytics', id: `EVENT_${eventId}` }
      ],
    }),

    // ===== EVENT SHARING =====

    getEventShareLinks: builder.query<ApiResponse<EventShareLinksDto>, number>({
      query: (eventId) => `/events/${eventId}/share-links`,
      providesTags: (result, error, eventId) => [
        { type: 'Event', id: `SHARE_${eventId}` }
      ],
    }),

    trackEventView: builder.mutation<ApiResponse<void>, TrackViewRequest>({
      query: ({ eventId, source }) => ({
        url: `/events/${eventId}/track-view`,
        method: 'POST',
        body: { source },
      }),
    }),
  }),
})

// ===== EXPORTED HOOKS (Basic) =====

export const {
  // Read operations
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetUpcomingEventsQuery,
  useGetFeaturedEventsQuery,
  useSearchEventsQuery,
  useGetEventsByCategoryQuery,
  useGetRelatedEventsQuery,
  
  // Create/Update/Delete operations
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useDuplicateEventMutation,
  
  // Image management
  useUploadEventImageMutation,
  useDeleteEventImageMutation,
  useUpdateEventImageMutation,
  
  // Registration operations
  useRegisterForEventMutation,
  useCancelEventRegistrationMutation,
  useGetEventRegistrationsQuery,
  useUpdateRegistrationStatusMutation,
  
  // Admin operations
  useGetEventStatisticsQuery,
  useGetCapacityAlertsQuery,
  useBulkUpdateEventsMutation,
  useExportEventsMutation,
  
  // Publishing
  usePublishEventMutation,
  useUnpublishEventMutation,
  
  // Categories
  useGetCategoriesQuery,
  
  // Analytics
  useGetEventAnalyticsQuery,
  
  // Sharing
  useGetEventShareLinksQuery,
  useTrackEventViewMutation,
} = eventsApi