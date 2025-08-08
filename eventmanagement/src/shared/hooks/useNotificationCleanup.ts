import { useEffect } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { clearAllNotifications } from '@/features/notifications/notificationSlice'

interface NotificationCleanupConfig {
  enabled?: boolean
  intervalMinutes?: number
  olderThanHours?: number
}

export const useNotificationCleanup = (config: NotificationCleanupConfig = {}) => {
  const dispatch = useAppDispatch()
  const {
    enabled = true,
    intervalMinutes = 30, // Run cleanup every 30 minutes
    olderThanHours = 24,  // Remove read notifications older than 24 hours
  } = config

  useEffect(() => {
    if (!enabled) return

    const cleanup = () => {
      dispatch(clearAllNotifications())
      console.log(`🧹 Cleaned up old notifications (older than ${olderThanHours}h)`)
    }

    // Run cleanup immediately
    cleanup()

    // Set up periodic cleanup
    const interval = setInterval(cleanup, intervalMinutes * 60 * 1000)

    return () => clearInterval(interval)
  }, [dispatch, enabled, intervalMinutes, olderThanHours])
}
