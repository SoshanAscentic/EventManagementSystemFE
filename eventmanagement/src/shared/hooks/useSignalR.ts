import { useEffect } from 'react'
import { useAppSelector } from '@/app/hooks'
import { signalRService } from '@/shared/lib/signalr'
import { useAuth } from './useAuth'

export const useSignalR = () => {
  const { isAuthenticated, roles } = useAuth()
  const connectionStatus = useAppSelector(state => state.notifications.connectionStatus)

  useEffect(() => {
    if (isAuthenticated) {
      signalRService.start().then(() => {
        // Join role-specific groups
        roles.forEach(role => {
          if (role === 'Admin') {
            signalRService.joinAdminGroup?.()
          }
        })
      }).catch(console.error)
    } else {
      signalRService.stop().catch(console.error)
    }

    return () => {
      signalRService.stop().catch(console.error)
    }
  }, [isAuthenticated, roles])

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  }
}