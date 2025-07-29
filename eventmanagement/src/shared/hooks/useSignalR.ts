import { useEffect, useState } from 'react'
import { signalRService } from '@/shared/lib/signalr'
import { useAuth } from './useAuth'

export const useSignalR = () => {
  const { isAuthenticated, user } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')

  useEffect(() => {
    if (isAuthenticated && user) {
      setConnectionStatus('connecting')
      
      signalRService.start()
        .then(() => {
          setConnectionStatus(signalRService.connectionStatus as 'connected' | 'disconnected')
          
          // Join role-specific groups based on user roles
          if (user.roles && user.roles.includes('Admin')) {
            signalRService.joinAdminGroup()
          }
        })
        .catch(() => {
          setConnectionStatus('disconnected')
        })
    } else {
      signalRService.stop()
        .then(() => {
          setConnectionStatus('disconnected')
        })
        .catch(() => {
          setConnectionStatus('disconnected')
        })
    }

    return () => {
      signalRService.stop().catch(() => {
        // Ignore cleanup errors
      })
    }
  }, [isAuthenticated, user])

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  }
} 