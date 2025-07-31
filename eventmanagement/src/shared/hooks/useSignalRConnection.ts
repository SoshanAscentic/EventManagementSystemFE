import { useEffect, useRef } from 'react'
import { signalRService } from '@/shared/lib/signalr'
import { useAuth } from './useAuth'

export const useSignalRConnection = () => {
  const { isAuthenticated, user } = useAuth()
  const initializationRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // ✅ Only initialize if authenticated and not already initialized
    if (!isAuthenticated || !user || initializationRef.current) {
      return
    }

    initializationRef.current = true
    
    const initializeSignalR = async () => {
      try {
        console.log('SignalR: Initializing connection...')
        signalRService.enable()
        await signalRService.start()
      } catch (error) {
        console.warn('SignalR: Failed to initialize:', error)
      }
    }

    // ✅ Small delay to ensure other initialization is complete
    const timeoutId = setTimeout(initializeSignalR, 500)

    cleanupRef.current = () => {
      clearTimeout(timeoutId)
      signalRService.disable()
      signalRService.stop().catch(console.warn)
      initializationRef.current = false
    }

    return cleanupRef.current
  }, [isAuthenticated, user?.id]) // ✅ Add dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])
}