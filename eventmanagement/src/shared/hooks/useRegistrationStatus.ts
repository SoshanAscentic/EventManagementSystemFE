import { useMemo } from 'react'
import { useGetMyRegistrationsQuery } from '@/features/registrations/api/registrationsApi'
import { useAuth } from './useAuth'

interface RegistrationStatus {
  isRegistered: boolean
  registration: any | null
  canCancel: boolean
  isLoading: boolean
}

export const useRegistrationStatus = (eventId: number): RegistrationStatus => {
  const { isAuthenticated } = useAuth()
  
  // Fetch user's registrations
  const { 
    data: registrationsData, 
    isLoading 
  } = useGetMyRegistrationsQuery({
    pageNumber: 1,
    pageSize: 100, // Get enough to check all registrations
    ascending: false,
  }, {
    skip: !isAuthenticated || !eventId,
  })

  // Find the registration for this specific event
  const registrationStatus = useMemo(() => {
    if (!isAuthenticated || !eventId) {
      return {
        isRegistered: false,
        registration: null,
        canCancel: false,
        isLoading: false
      }
    }

    if (isLoading) {
      return {
        isRegistered: false,
        registration: null,
        canCancel: false,
        isLoading: true
      }
    }

    const registrations = registrationsData?.data?.items || []
    const registration = registrations.find(
      reg => reg.eventId === eventId && reg.status === 'Registered'
    )

    return {
      isRegistered: !!registration,
      registration: registration || null,
      canCancel: registration?.canCancel || false,
      isLoading: false
    }
  }, [isAuthenticated, eventId, registrationsData, isLoading])

  return registrationStatus
}