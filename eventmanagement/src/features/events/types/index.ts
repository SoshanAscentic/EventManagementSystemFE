import { PaginationParams } from '@/shared/types/api'

// ===== REQUEST/RESPONSE TYPE DEFINITIONS =====

export interface CreateEventRequest {
  title: string                    // ≤200 chars
  description: string              // ≤2000 chars  
  startDateTime: string            // ISO future date
  endDateTime: string              // ISO > start
  venue: string                    // ≤100 chars
  address: string                  // ≤200 chars
  city?: string                    // ≤100 chars
  country?: string                 // ≤100 chars
  capacity: number                 // > 0, ≤ 10000
  eventType: string                // Conference | Workshop | etc
  categoryId: number               // > 0
}

export interface UpdateEventRequest {
  id: number
  title?: string
  description?: string
  startDateTime?: string
  endDateTime?: string
  venue?: string
  address?: string
  city?: string
  country?: string
  capacity?: number
  eventType?: string
  categoryId?: number
}

export interface UpdateCapacityRequest {
  newCapacity: number
}

export interface EventsQueryParams extends PaginationParams {
  searchTerm?: string
  categoryId?: number
  eventType?: string
  startDate?: string
  endDate?: string
  location?: string
  hasAvailableSpots?: boolean
  sortBy?: 'title' | 'startDateTime' | 'createdAt'
  Ascending?: boolean 
}

export interface UpcomingEventsParams {
  categoryId?: number
  count?: number
}

export interface RegisterForEventRequest {
  eventId: number
  notes?: string
}

export interface CancelRegistrationRequest {
  registrationId: number
  reason?: string
}

export interface UploadImageRequest {
  eventId: number
  file: File
  isPrimary: boolean
}

export interface MarkAttendanceRequest {
  registrationId: number
  attended: boolean
}

// ===== UTILITY TYPES =====

export type EventSortOption = 'title' | 'startDateTime' | 'createdAt'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type RegistrationStatus = 'active' | 'cancelled' | 'attended'

// ===== FILTER TYPES =====

export interface EventFilters {
  searchTerm: string
  categoryId?: number
  eventType?: string
  startDate?: string
  endDate?: string
  location?: string
  hasAvailableSpots: boolean
}

export interface AdvancedEventFilters extends EventFilters {
  status?: EventStatus
  capacity?: { min: number; max: number }
  registrationCount?: { min: number; max: number }
}

// ===== IMAGE MANAGEMENT TYPES =====

export interface UploadImageRequest {
  eventId: number
  file: File
  isPrimary: boolean
}

export interface SetImagePrimaryRequest {
  eventId: number
  imageId: number
}

export interface DeleteImageRequest {
  eventId: number
  imageId: number
}

export interface EventImageDto {
  id: number
  url: string
  isPrimary: boolean
  altText?: string
}

// Enhanced CreateEventRequest to support image upload workflow
export interface CreateEventRequestWithImages extends CreateEventRequest {
  useDefaultImage?: boolean
  newImages?: Array<{
    id: number
    url: string
    isPrimary: boolean
    file?: File
    isNew?: boolean
  }>
}
// ===== CAPACITY MANAGEMENT TYPES =====

export interface UpdateEventCapacityRequest {
  id: number
  newCapacity: number
}
