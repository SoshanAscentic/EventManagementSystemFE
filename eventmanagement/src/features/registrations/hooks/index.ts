import { useState, useCallback, useMemo } from 'react'
import { useGetMyRegistrationsQuery, useCancelRegistrationMutation } from '../api/registrationsApi'
import type { RegistrationFilters } from '../types'

export const useMyRegistrations = () => {
  const [filters, setFilters] = useState<RegistrationFilters>({
    status: 'all',
    timeframe: 'upcoming',
  })

  const { data, isLoading, error } = useGetMyRegistrationsQuery({
    status: filters.status === 'all' ? undefined : filters.status,
    upcoming: filters.timeframe === 'upcoming',
    past: filters.timeframe === 'past',
  })

  const updateFilter = useCallback((key: keyof RegistrationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    registrations: data?.data?.items || [],
    totalCount: data?.data?.totalCount || 0,
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
      await cancelRegistration({ id: registrationId, reason }).unwrap()
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