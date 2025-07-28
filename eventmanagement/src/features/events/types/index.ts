// src/features/events/types/index.ts
import { PaginationParams } from '@/shared/types/api'

// REQUEST/RESPONSE TYPE DEFINITIONS

export interface CreateEventRequest {
  title: string
  description: string
  startDateTime: string
  endDateTime: string
  venue: string
  address: string
  city?: string
  country?: string
  capacity: number
  eventType: string
  categoryId: number
  isPrivate?: boolean
  requiresApproval?: boolean
  tags?: string[]
}

export interface UpdateEventRequest extends CreateEventRequest {
  id: number
}

export interface EventsQueryParams extends PaginationParams {
  searchTerm?: string
  categoryId?: number
  startDate?: string
  endDate?: string
  eventType?: string
  hasAvailableSpots?: boolean
  isFeatured?: boolean
  location?: string
  tags?: string[]
  sortBy?: 'title' | 'startDateTime' | 'createdAt' | 'capacity' | 'registrationCount'
  ascending?: boolean
  includePrivate?: boolean
}

export interface UpcomingEventsParams {
  categoryId?: number
  count?: number
  includePrivate?: boolean
}

export interface RegisterForEventRequest {
  eventId: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  jobTitle?: string
  dietaryRestrictions?: string
  specialRequirements?: string
  notes?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  agreeToTerms: boolean
  subscribeToUpdates?: boolean
}

export interface UploadImageRequest {
  eventId: number
  file: File
  isPrimary: boolean
  altText?: string
}

export interface EventImageDto {
  id: number
  url: string
  isPrimary: boolean
  altText?: string
  uploadedAt: string
}

export interface EventStatisticsDto {
  totalEvents: number
  totalRegistrations: number
  averageCapacity: number
  mostPopularCategory: string
  upcomingEvents: number
  eventsByMonth: Array<{
    month: string
    count: number
  }>
  registrationTrends: Array<{
    date: string
    registrations: number
  }>
}

export interface EventAnalyticsDto {
  views: number
  registrations: number
  conversionRate: number
  viewsByDay: Array<{
    date: string
    views: number
  }>
  registrationsByDay: Array<{
    date: string
    registrations: number
  }>
  topReferrers: Array<{
    source: string
    views: number
  }>
}

export interface EventShareLinksDto {
  facebook: string
  twitter: string
  linkedin: string
  email: string
  whatsapp: string
  copy: string
}

export interface BulkUpdateRequest {
  eventIds: number[]
  updates: Partial<CreateEventRequest>
}

export interface ExportRequest {
  format: 'csv' | 'excel'
  filters?: EventsQueryParams
}

export interface RegistrationUpdateRequest {
  registrationId: number
  status: string
  notes?: string
}

export interface CancelRegistrationRequest {
  registrationId: number
  reason?: string
}

export interface TrackViewRequest {
  eventId: number
  source?: string
}

// UTILITY TYPES

export type EventSortOption = 'title' | 'startDateTime' | 'createdAt' | 'capacity' | 'registrationCount'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type RegistrationStatus = 'active' | 'cancelled' | 'waitlist' | 'checkedIn'
export type ExportFormat = 'csv' | 'excel'

// FILTER TYPES 

export interface EventFilters {
  searchTerm: string
  categoryId?: number
  eventType?: string
  startDate?: string
  endDate?: string
  location?: string
  hasAvailableSpots: boolean
  isFeatured: boolean
  tags: string[]
  priceRange?: { min: number; max: number }
}

export interface AdvancedEventFilters extends EventFilters {
  status?: EventStatus
  createdBy?: number
  capacity?: { min: number; max: number }
  registrationCount?: { min: number; max: number }
}