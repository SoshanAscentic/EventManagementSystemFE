import { useState, useCallback, useMemo } from 'react'
import { useGetMyRegistrationsQuery, useCancelRegistrationMutation } from '../api/registrationsApi'
import type { RegistrationFilters } from '../types'

export const useMyRegistrations = () => {
  const [filters, setFilters] = useState<RegistrationFilters>({
    status: 'all',
    timeframe: 'upcoming',
  })

  const { data, isLoading, error } = useGetMyRegistrationsQuery({
    pageNumber: 1,
    pageSize: 50, // Get more registrations for filtering
    status: filters.status === 'all' ? undefined : filters.status,
    ascending: false, // Most recent first - ADD THIS REQUIRED PARAMETER
  })

  const updateFilter = useCallback((key: keyof RegistrationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Client-side filtering for timeframe since API doesn't support it
  const filteredRegistrations = useMemo(() => {
    if (!data?.data?.items) return []
    
    let filtered = data.data.items
    
    // Filter by timeframe
    if (filters.timeframe === 'upcoming') {
      filtered = filtered.filter(reg => 
        new Date(reg.eventStartDateTime) > new Date() && reg.status === 'Registered'
      )
    } else if (filters.timeframe === 'past') {
      filtered = filtered.filter(reg => 
        new Date(reg.eventStartDateTime) <= new Date()
      )
    }
    
    return filtered
  }, [data?.data?.items, filters.timeframe])

  return {
    registrations: filteredRegistrations,
    totalCount: filteredRegistrations.length,
    isLoading,
    error,
    filters,
    updateFilter,
  }
}

export const useRegistrationActions = () => {
  const [cancelRegistration, { isLoading }] = useCancelRegistrationMutation()

  const handleCancel = useCallback(async (registrationId: number, reason?: string) => {
    try {
      await cancelRegistration({ registrationId, reason }).unwrap()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [cancelRegistration])

  return {
    handleCancel,
    isLoading,
  }
}