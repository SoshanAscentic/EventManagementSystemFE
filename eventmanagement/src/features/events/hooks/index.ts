import { useCallback, useEffect, useMemo, useState } from 'react'
import { 
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  eventsApi,
} from '../api/eventsApi'
import { useRegisterForEventMutation } from '@/features/registrations/api/registrationsApi'
import { useAppDispatch } from '@/app/hooks'
import { useAuth } from '@/shared/hooks/useAuth'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { 
  EventsQueryParams, 
  CreateEventRequest,
} from '../types'
import type { RegisterForEventRequest } from '@/features/registrations/api/registrationsApi'

// ===== OPTIMIZED QUERIES =====

/**
 * Custom hook for optimized event fetching with debounced search
 */
export const useOptimizedEvents = (params: EventsQueryParams) => {
  const debouncedSearchTerm = useDebounce(params.searchTerm || '', 300)
  
  return useGetEventsQuery({
    ...params,
    searchTerm: debouncedSearchTerm,
  }, {
    // Skip query if search term is being typed
    skip: params.searchTerm !== debouncedSearchTerm,
    // Refetch on window focus for fresh data
    refetchOnFocus: true,
    // Cache for 5 minutes
    pollingInterval: 300000,
  })
}

/**
 * Hook for smart event fetching with caching strategy
 */
export const useSmartEventFetch = (params: EventsQueryParams) => {
  const cacheKey = useMemo(() => 
    JSON.stringify(params), [params]
  )
  
  return useGetEventsQuery(params, {
    selectFromResult: ({ data, ...other }) => ({
      ...other,
      data,
      cacheKey,
    }),
  })
}

// ===== EVENT MANAGEMENT HOOKS =====

/**
 * Custom hook for event creation with error handling and authorization
 */
export const useCreateEventWithAuth = () => {
  const { hasPermission } = useAuth()
  const [createEvent, result] = useCreateEventMutation()
  
  const createEventIfAuthorized = useCallback(async (data: CreateEventRequest) => {
    if (!hasPermission('canCreateEvents')) {
      throw new Error('You do not have permission to create events')
    }
    
    try {
      const response = await createEvent(data).unwrap()
      return response
    } catch (error: any) {
      if (error.status === 403) {
        throw new Error('You do not have permission to create events')
      }
      if (error.status === 400) {
        throw new Error(error.data?.message || 'Invalid event data')
      }
      throw error
    }
  }, [createEvent, hasPermission])
  
  return [createEventIfAuthorized, result] as const
}

/**
 * Hook for event registration with capacity and eligibility checking
 */
export const useEventRegistration = (eventId: number) => {
  const [registerForEvent, { isLoading, error }] = useRegisterForEventMutation()
  const { data: eventData, isLoading: eventLoading } = useGetEventByIdQuery(eventId)
  const { isAuthenticated } = useAuth()
  
  const event = eventData?.data
  
  const canRegister = useMemo(() => {
    if (!event || !isAuthenticated) return false
    
    return (
      event.remainingCapacity > 0 &&
      event.isRegistrationOpen &&
      !event.isUserRegistered
    )
  }, [event, isAuthenticated])
  
  const register = useCallback(async (registrationData: Omit<RegisterForEventRequest, 'eventId'>) => {
    if (!event) {
      throw new Error('Event not found')
    }
    
    if (!isAuthenticated) {
      throw new Error('You must be logged in to register')
    }
    
    if (event.remainingCapacity <= 0) {
      throw new Error('Event is at full capacity')
    }
    
    if (!event.isRegistrationOpen) {
      throw new Error('Registration is closed for this event')
    }
    
    if (event.isUserRegistered) {
      throw new Error('You are already registered for this event')
    }
    
    return registerForEvent({
      ...registrationData,
      eventId,
    }).unwrap()
  }, [registerForEvent, event, eventId, isAuthenticated])
  
  return {
    register,
    canRegister,
    isLoading,
    error,
    event,
    eventLoading,
    remainingSpots: event?.remainingCapacity || 0,
    isRegistered: event?.isUserRegistered || false,
  }
}

// ===== FILTER AND SEARCH HOOKS =====

/**
 * Hook for managing event filters with URL sync
 */
export const useEventFilters = (initialFilters: EventsQueryParams = {}) => {
  const [filters, setFilters] = useState<EventsQueryParams>(initialFilters)
  
  const updateFilter = useCallback((key: keyof EventsQueryParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: 1, // Reset to first page when filtering
    }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters({
      pageNumber: 1,
      pageSize: initialFilters.pageSize || 10,
    })
  }, [initialFilters.pageSize])
  
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'pageNumber' || key === 'pageSize') return false
      return value !== undefined && value !== null && value !== ''
    })
  }, [filters])
  
  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    setFilters,
  }
}

/**
 * Hook for debounced search with suggestions
 */
export const useEventSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const { data: searchResults, isLoading } = useGetEventsQuery({
    searchTerm: debouncedSearchTerm,
    pageSize: 5,
  }, {
    skip: debouncedSearchTerm.length < 2,
  })
  
  // Update suggestions based on search results
  useEffect(() => {
    if (searchResults?.data?.items) {
      const newSuggestions = searchResults.data.items
        .map(event => event.title)
        .slice(0, 5)
      setSuggestions(newSuggestions)
    }
  }, [searchResults])
  
  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    searchResults: searchResults?.data?.items || [],
    isLoading,
  }
}

// ===== CACHE MANAGEMENT HOOKS =====

/**
 * Hook for cache invalidation and management
 */
export const useCacheManagement = () => {
  const dispatch = useAppDispatch()
  
  const invalidateEventCaches = useCallback((eventId?: number) => {
    if (eventId) {
      dispatch(eventsApi.util.invalidateTags([
        { type: 'Event', id: eventId },
        { type: 'Event', id: 'LIST' },
        { type: 'Registration', id: `EVENT_${eventId}` }
      ]))
    } else {
      dispatch(eventsApi.util.invalidateTags([{ type: 'Event', id: 'LIST' }]))
    }
  }, [dispatch])
  
  const prefetchEvent = useCallback((eventId: number) => {
    dispatch(eventsApi.util.prefetch('getEventById', eventId, { force: false }))
  }, [dispatch])
  
  const prefetchEvents = useCallback((params: EventsQueryParams) => {
    dispatch(eventsApi.util.prefetch('getEvents', params, { force: false }))
  }, [dispatch])
  
  return {
    invalidateEventCaches,
    prefetchEvent,
    prefetchEvents,
  }
}

// ===== UTILITY HOOKS =====

/**
 * Hook for event validation and formatting - Updated to match backend
 */
export const useEventValidation = () => {
  const formatEventForApi = useCallback((eventData: any): CreateEventRequest => {
    return {
      title: eventData.title?.trim(),
      description: eventData.description?.trim(),
      startDateTime: eventData.startDateTime,
      endDateTime: eventData.endDateTime,
      venue: eventData.venue?.trim(),
      address: eventData.address?.trim(),
      city: eventData.city?.trim() || undefined,
      country: eventData.country?.trim() || undefined,
      capacity: Number(eventData.capacity),
      eventType: eventData.eventType,
      categoryId: Number(eventData.categoryId),
      // Removed: isPrivate, requiresApproval, tags (not supported by backend)
    }
  }, [])
  
  const validateEventDates = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()
    
    if (start <= now) {
      return 'Start date must be in the future'
    }
    
    if (end <= start) {
      return 'End date must be after start date'
    }
    
    return null
  }, [])
  
  const validateEventData = useCallback((eventData: any) => {
    const errors: string[] = []
    
    if (!eventData.title?.trim()) {
      errors.push('Title is required')
    } else if (eventData.title.length > 200) {
      errors.push('Title must be less than 200 characters')
    }
    
    if (!eventData.description?.trim()) {
      errors.push('Description is required')
    } else if (eventData.description.length > 2000) {
      errors.push('Description must be less than 2000 characters')
    }
    
    if (!eventData.venue?.trim()) {
      errors.push('Venue is required')
    } else if (eventData.venue.length > 100) {
      errors.push('Venue must be less than 100 characters')
    }
    
    if (!eventData.address?.trim()) {
      errors.push('Address is required')
    } else if (eventData.address.length > 200) {
      errors.push('Address must be less than 200 characters')
    }
    
    if (!eventData.capacity || eventData.capacity <= 0) {
      errors.push('Capacity must be greater than 0')
    } else if (eventData.capacity > 10000) {
      errors.push('Capacity cannot exceed 10,000')
    }
    
    if (!eventData.eventType) {
      errors.push('Event type is required')
    }
    
    if (!eventData.categoryId || eventData.categoryId <= 0) {
      errors.push('Category is required')
    }
    
    // Date validation
    const dateError = validateEventDates(eventData.startDateTime, eventData.endDateTime)
    if (dateError) {
      errors.push(dateError)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [validateEventDates])
  
  return {
    formatEventForApi,
    validateEventDates,
    validateEventData,
  }
}

// ===== EXPORT ALL HOOKS =====

export {
  // API hooks are re-exported from the API file
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
} from '../api/eventsApi'

export {
  // Registration hooks from registrations API
  useRegisterForEventMutation,
} from '@/features/registrations/api/registrationsApi'
