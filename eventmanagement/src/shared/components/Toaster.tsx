import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { removeNotification } from '@/features/notifications/notificationSlice'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { createSelector } from '@reduxjs/toolkit'

// Memoized selector to prevent unnecessary rerenders
const selectToastNotifications = createSelector(
  [(state: any) => state.notifications.notifications],
  (notifications) => notifications.filter((n: any) => n.type !== 'info').slice(0, 5)
)

export const Toaster = () => {
  const notifications = useAppSelector(selectToastNotifications)
  const dispatch = useAppDispatch()

  const removeToast = (id: string) => {
    dispatch(removeNotification(id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

interface ToastProps {
  notification: any
  onRemove: (id: string) => void
}

const Toast = ({ notification, onRemove }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification.id, onRemove])

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return 'CheckCircle'
      case 'warning': return 'AlertTriangle'
      case 'error': return 'AlertCircle'
      default: return 'Info'
    }
  }

  const getStyles = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className={cn(
      'min-w-80 max-w-sm p-4 rounded-lg border shadow-lg animate-slide-in',
      getStyles()
    )}>
      <div className="flex items-start">
        <Icon name={getIcon() as any} className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm mt-1 opacity-90">{notification.message}</p>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="ml-2 p-1 hover:bg-black/10 rounded"
        >
          <Icon name="X" className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}