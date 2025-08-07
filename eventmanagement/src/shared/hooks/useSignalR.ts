import { useEffect, useState, useRef } from 'react'
import { signalRService } from '@/shared/lib/signalr'
import { useAuth } from './useAuth'

export const useSignalR = () => {
  const { isAuthenticated, user } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const initializationRef = useRef(false)

  useEffect(() => {
    // Only initialize if authenticated and not already initialized
    if (!isAuthenticated || !user || initializationRef.current) {
      return
    }

    initializationRef.current = true
    
    const initializeSignalR = async () => {
      try {
        console.log('SignalR: Initializing connection for user:', user.id)
        signalRService.enable()
        await signalRService.start()
        setConnectionStatus(signalRService.connectionStatus as any)
      } catch (error) {
        console.warn('SignalR: Failed to initialize:', error)
        setConnectionStatus('disconnected')
      }
    }

    // Small delay to ensure other initialization is complete
    const timeoutId = setTimeout(initializeSignalR, 1000)

    // Set up status polling
    const statusInterval = setInterval(() => {
      setConnectionStatus(signalRService.connectionStatus as any)
    }, 3000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(statusInterval)
    }
  }, [isAuthenticated, user?.id])

  // Cleanup on unmount or auth change
  useEffect(() => {
    return () => {
      if (!isAuthenticated && initializationRef.current) {
        console.log('SignalR: Cleaning up due to auth change')
        signalRService.disable()
        signalRService.stop().catch(console.warn)
        initializationRef.current = false
        setConnectionStatus('disconnected')
      }
    }
  }, [isAuthenticated])

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    joinEventGroup: signalRService.joinEventGroup.bind(signalRService),
    leaveEventGroup: signalRService.leaveEventGroup.bind(signalRService),
    testConnection: signalRService.testConnection.bind(signalRService),
    testNotification: signalRService.testNotificationReception.bind(signalRService),
  }
}