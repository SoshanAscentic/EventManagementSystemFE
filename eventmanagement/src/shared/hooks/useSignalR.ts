import { useEffect, useState, useRef } from 'react'
import { signalRService } from '@/shared/lib/signalr'
import { useAuth } from './useAuth'

export const useSignalR = () => {
  const { isAuthenticated, user } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const initializationRef = useRef(false)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) return

    if (isAuthenticated && user) {
      initializationRef.current = true
      setConnectionStatus('connecting')
      
      const initializeSignalR = async () => {
        try {
          await signalRService.start()
          setConnectionStatus(signalRService.connectionStatus as 'connected' | 'disconnected' | 'connecting')
        } catch (error) {
          console.warn('Failed to initialize SignalR:', error)
          setConnectionStatus('disconnected')
        }
      }

      initializeSignalR()

      // Set up status checker
      statusIntervalRef.current = setInterval(() => {
        setConnectionStatus(signalRService.connectionStatus as 'connected' | 'disconnected' | 'connecting')
      }, 2000) // Reduced frequency
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
        statusIntervalRef.current = null
      }
    }
  }, [isAuthenticated, user?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
      if (initializationRef.current) {
        signalRService.stop()
        initializationRef.current = false
      }
    }
  }, [])

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    joinEventGroup: signalRService.joinEventGroup.bind(signalRService),
    leaveEventGroup: signalRService.leaveEventGroup.bind(signalRService),
  }
}