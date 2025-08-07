import { useEffect } from 'react'
import { useSignalR } from './useSignalR'

export const useEventSignalR = (eventId?: number) => {
  const { isConnected, joinEventGroup, leaveEventGroup } = useSignalR()

  useEffect(() => {
    if (isConnected && eventId) {
      // Join event group when connected and eventId is available
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
  }, [isConnected, eventId, joinEventGroup, leaveEventGroup])

  return {
    isConnected,
    eventId
  }
}