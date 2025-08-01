import { useEffect } from 'react'
import { useSignalR } from './useSignalR'

/**
 * Hook to automatically join/leave event groups when viewing event details
 */
export const useEventSignalR = (eventId?: number) => {
  const { isConnected, isConnecting, joinEventGroup, leaveEventGroup } = useSignalR()

  useEffect(() => {
    if (isConnected && eventId && !isConnecting) {
      // Add a small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        joinEventGroup(eventId)
      }, 500)

      // Cleanup: leave event group when component unmounts or eventId changes
      return () => {
        clearTimeout(timer)
        if (isConnected) {
          leaveEventGroup(eventId)
        }
      }
    }
  }, [isConnected, isConnecting, eventId, joinEventGroup, leaveEventGroup])

  return {
    isConnected,
    isConnecting,
    eventId
  }
}