import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { hideToast, markAsRead } from '@/features/notifications/notificationSlice'
import { store } from '@/app/store/store'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

interface ToastNotification {
  id: string
  title: string
  message: string
  type: string
  timestamp: number
  data?: any
  actionUrl?: string
  persistent?: boolean
  showInToast?: boolean
  read: boolean
  toastDismissed?: boolean // NEW: Track if toast was dismissed
}

// Custom hook to safely use navigate
const useSafeNavigate = () => {
  try {
    const navigate = useNavigate()
    return { navigate, isRouterContext: true }
  } catch (error) {
    console.warn('Toaster: Not in Router context, using window.location for navigation')
    return { 
      navigate: (path: string) => {
        window.location.href = path
      }, 
      isRouterContext: false 
    }
  }
}

export const Toaster = () => {
  const dispatch = useAppDispatch()
  const { navigate, isRouterContext } = useSafeNavigate()
  
  const notificationState = useAppSelector(state => {
    console.log('🔍 Toaster useAppSelector - Notifications state:', state.notifications)
    return state.notifications
  })

  const directStoreState = store.getState().notifications
  
  console.log('🔍 STORE COMPARISON:', {
    'useAppSelector notifications': notificationState?.notifications?.length || 0,
    'useAppSelector unread': notificationState?.unreadCount || 0,
    'directStore notifications': directStoreState?.notifications?.length || 0,
    'directStore unread': directStoreState?.unreadCount || 0,
    'stores match': (notificationState?.notifications?.length || 0) === (directStoreState?.notifications?.length || 0),
    'router context': isRouterContext
  })

  const notifications = notificationState?.notifications || directStoreState?.notifications || []
  const unreadCount = notificationState?.unreadCount || directStoreState?.unreadCount || 0

  // UPDATED: Filter for toast notifications - show if unread AND not dismissed AND showInToast
  const toastNotifications = notifications
    .filter((n: ToastNotification) => {
      const shouldShow = !n.read && !n.toastDismissed && (n.showInToast !== false)
      console.log('🍞 Toast filter check:', {
        id: n.id?.slice(-8) || 'no-id',
        type: n.type,
        title: n.title?.slice(0, 20),
        read: n.read,
        toastDismissed: n.toastDismissed,
        showInToast: n.showInToast,
        shouldShow
      })
      return shouldShow
    })
    .slice(0, 5)

  console.log('🍞 Toaster - Final state:', {
    totalNotifications: notifications.length,
    unreadCount,
    toastCount: toastNotifications.length,
    toastIds: toastNotifications.map(t => ({ 
      id: t.id?.slice(-8) || 'no-id', 
      type: t.type,
      title: t.title?.slice(0, 20) || 'no-title'
    }))
  })

  // UPDATED: Hide toast without marking as read
  const hideToastOnly = (id: string) => {
    console.log('🍞 Toaster - Hiding toast (keeping unread):', id)
    dispatch(hideToast(id))
  }

  // UPDATED: Navigation function that works with or without Router context
  const handleToastClick = (notification: ToastNotification) => {
    console.log('🍞 Toast clicked - marking as read:', notification.id)
    console.log('🍞 Router context available:', isRouterContext)
    
    // Mark as read when user actively clicks
    if (!notification.read) {
      dispatch(markAsRead(notification.id))
    }
    
    let targetPath = ''
    
    // Determine target path based on notification
    if (notification.actionUrl) {
      targetPath = notification.actionUrl
    } else if (notification.data?.eventId) {
      // Check if eventId is valid before navigating
      const eventId = notification.data.eventId
      if (eventId && (typeof eventId === 'string' || typeof eventId === 'number')) {
        targetPath = `/events/${eventId}`
      }
    } else {
      // Enhanced navigation logic based on notification type and user role
      switch (notification.type) {
        case 'RegistrationConfirmed':
        case 'RegistrationCancelled':
          // Users should go to their registrations page
          targetPath = '/registrations'
          break
        case 'EventCreated':
        case 'EventUpdated':
        case 'EventCancelled':
          // Check if this is an admin notification
          if (notification.data?.eventId) {
            // If notification is for admin (like "New registration received"), go to admin dashboard
            if (notification.message?.toLowerCase().includes('registration received') || 
                notification.message?.toLowerCase().includes('new registration') ||
                notification.title?.toLowerCase().includes('admin')) {
              targetPath = '/admin'
            } else {
              // Regular event notifications go to event details
              targetPath = `/events/${notification.data.eventId}`
            }
          } else {
            // Default to events list
            targetPath = '/events'
          }
          break
        case 'EventReminder':
          // Event reminders should go to the specific event
          if (notification.data?.eventId) {
            targetPath = `/events/${notification.data.eventId}`
          } else {
            targetPath = '/my-registrations'
          }
          break
        default:
          // If no specific action, don't navigate anywhere
          console.log('No navigation action defined for notification type:', notification.type)
          return
      }
    }
    
    // Navigate to target path
    if (targetPath) {
      console.log('🍞 Navigating to:', targetPath, 'using:', isRouterContext ? 'React Router' : 'window.location')
      navigate(targetPath)
    }
  }

  // Store subscription for debugging
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const currentState = store.getState().notifications
      console.log('📡 Direct Store Update Detected:', {
        total: currentState?.notifications?.length || 0,
        unread: currentState?.unreadCount || 0,
        timestamp: Date.now()
      })
    })
    
    return () => unsubscribe()
  }, [])

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toastNotifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onHide={hideToastOnly}
            onClick={handleToastClick}
          />
        ))}
      </div>
    </>
  )
}

const Toast = ({ 
  notification, 
  onHide,
  onClick 
}: {
  notification: ToastNotification
  onHide: (id: string) => void
  onClick: (notification: ToastNotification) => void
}) => {
  console.log('🍞 Toast - Rendering:', notification.id?.slice(-8) || 'no-id', notification.type)

  useEffect(() => {
    // UPDATED: Auto-hide after 8 seconds without marking as read
    const timer = setTimeout(() => {
      console.log('🍞 Toast - Auto hiding (keeping unread):', notification.id?.slice(-8) || 'no-id')
      onHide(notification.id) // This will hide the toast but keep notification unread
    }, 8000) // 8 seconds

    return () => clearTimeout(timer)
  }, [notification.id, onHide])

  const getStyle = (type: string) => {
    const styleMap: Record<string, any> = {
      'EventCreated': {
        icon: 'Calendar',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        emoji: '🎉'
      },
      'EventUpdated': {
        icon: 'Edit3',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        emoji: '📝'
      },
      'EventCancelled': {
        icon: 'X',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        emoji: '❌'
      },
      'RegistrationConfirmed': {
        icon: 'CheckCircle',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        emoji: '✅'
      },
      'RegistrationCancelled': {
        icon: 'XCircle',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        emoji: '🚫'
      },
      'EventReminder': {
        icon: 'Clock',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        emoji: '⏰'
      },
      'success': {
        icon: 'CheckCircle',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        emoji: '✅'
      },
      'error': {
        icon: 'AlertCircle',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        emoji: '❌'
      },
      'warning': {
        icon: 'AlertTriangle',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        emoji: '⚠️'
      },
      'info': {
        icon: 'Info',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        emoji: 'ℹ️'
      }
    }
    
    return styleMap[type] || styleMap['info']
  }

  const style = getStyle(notification.type)

  return (
    <div
      className={cn(
        'min-w-80 max-w-sm rounded-lg border shadow-lg transition-all duration-300 pointer-events-auto animate-in slide-in-from-right',
        style.bgColor,
        style.borderColor,
        'cursor-pointer hover:shadow-xl hover:scale-105'
      )}
      onClick={() => onClick(notification)}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon with emoji */}
          <div className="relative flex-shrink-0 mr-3">
            <div className={cn('p-2 rounded-full', style.bgColor.replace('50', '100'))}>
              <Icon name={style.icon as any} className={cn('h-5 w-5', style.textColor)} />
            </div>
            <span className="absolute -top-1 -right-1 text-sm">{style.emoji}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-sm', style.textColor)}>
              {notification.title || 'No Title'}
            </p>
            <p className="text-sm mt-1 text-gray-700 line-clamp-2">
              {notification.message || 'No message'}
            </p>
            
            {/* Updated instruction for user */}
            <div className="text-xs text-gray-500 mt-2">
              Click to read & navigate • Auto-hides in 8s
            </div>
            
            {/* Updated action hint */}
            {(notification.actionUrl || notification.data?.eventId || 
              ['RegistrationConfirmed', 'RegistrationCancelled', 'EventCreated', 'EventUpdated', 'EventCancelled', 'EventReminder'].includes(notification.type)) && (
              <p className="text-xs text-blue-600 mt-1">Click to navigate →</p>
            )}
          </div>

          {/* Close button - hides without marking as read */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log('🍞 Manual close - hiding toast (keeping unread)')
              onHide(notification.id)
            }}
            className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
            title="Hide toast (notification stays unread)"
          >
            <Icon name="X" className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}