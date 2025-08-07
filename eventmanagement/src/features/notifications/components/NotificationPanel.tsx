import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, Icon } from '@/components/atoms'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { markAsRead, markAllAsRead, removeNotification, addNotification } from '@/features/notifications/notificationSlice'
import { signalRService } from '@/shared/lib/signalr'
import { cn } from '@/lib/utils'

interface NotificationTypeConfig {
  icon: string
  color: string
  bgColor: string
  borderColor: string
  priority: number
}

const notificationTypeConfigs: Record<string, NotificationTypeConfig> = {
  // Basic types
  'success': {
    icon: 'CheckCircle',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    priority: 2
  },
  'warning': {
    icon: 'AlertTriangle', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    priority: 3
  },
  'error': {
    icon: 'AlertCircle',
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    priority: 4
  },

  //Event Specific Types
  'EventCreated': {
    icon: 'Calendar',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    priority: 2
  },
  'EventUpdated': {
    icon: 'Edit3',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    priority: 2
  },
  'RegistrationConfirmed': {
    icon: 'CheckCircle',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    priority: 2
  },
  'RegistrationCancelled': {
    icon: 'XCircle',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    priority: 3
  },
  'RegistrationMilestone': {
    icon: 'Trophy',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    priority: 2
  },
  'SpotAvailable': {
    icon: 'UserPlus',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    priority: 3
  },
  'HighDemand': {
    icon: 'TrendingUp',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    priority: 4
  }
}

const eventTypeConfigs: Record<string, { emoji: string, description: string }> = {
  'EventCreated': { emoji: '🎉', description: 'New event available' },
  'EventUpdated': { emoji: '📝', description: 'Event details changed' },
  'EventCancelled': { emoji: '❌', description: 'Event cancelled' },
  'RegistrationConfirmed': { emoji: '✅', description: 'Registration confirmed' },
  'RegistrationCancelled': { emoji: '🚫', description: 'Registration cancelled' },
  'EventReminder': { emoji: '⏰', description: 'Event reminder' },
  'EventCapacityReached': { emoji: '🏆', description: 'Event full' },
  'RegistrationMilestone': { emoji: '🎯', description: 'Registration milestone reached' },
  'SpotAvailable': { emoji: '🎪', description: 'New spot available' },
  'HighDemand': { emoji: '🔥', description: 'High demand event' }
}

export const NotificationPanel = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { notifications, unreadCount } = useAppSelector(state => state.notifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')
  const [signalRStatus, setSignalRStatus] = useState(signalRService.connectionStatus)

  // Update SignalR status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalRStatus(signalRService.connectionStatus)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // Filter notifications based on selected filter
  const filteredNotifications = notifications
    .filter(notification => {
      switch (filter) {
        case 'unread':
          return !notification.read
        case 'important':
          // Include both basic error/warning types AND event-specific important types
          return !notification.read && (
            ['error', 'warning'].includes(notification.type) ||
            ['EventCancelled', 'RegistrationCancelled', 'EventCapacityReached'].includes(notification.type)
          )
        default:
          return true
      }
    })
    .sort((a, b) => {
      // Sort by priority and timestamp
      const aConfig = notificationTypeConfigs[a.type]
      const bConfig = notificationTypeConfigs[b.type]
      
      if (aConfig && bConfig && aConfig.priority !== bConfig.priority) {
        return bConfig.priority - aConfig.priority
      }
      
      return b.timestamp - a.timestamp
    })

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleRemove = (id: string) => {
    dispatch(removeNotification(id))
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id))
    }

    // Navigate based on notification type and action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    } else if (notification.data?.eventId) {
      navigate(`/events/${notification.data.eventId}`)
    } else {
      // Default navigation based on notification type
      switch (notification.type) {
        case 'RegistrationConfirmed':
        case 'RegistrationCancelled':
          navigate('/registrations')
          break
        default:
          if (notification.data?.eventId) {
            navigate(`/events/${notification.data.eventId}`)
          }
      }
    }
  }

  const getNotificationIcon = (notification: any) => {
    const config = notificationTypeConfigs[notification.type]
    return config?.icon || 'Info'
  }

  const getNotificationStyles = (notification: any) => {
    const config = notificationTypeConfigs[notification.type]
    const baseStyles = {
      color: config?.color || 'text-blue-600',
      bgColor: config?.bgColor || 'bg-blue-50',
      borderColor: config?.borderColor || 'border-blue-200'
    }

    // If read, make the colors more muted but preserve the type-specific hue
    if (notification.read) {
      return {
        color: baseStyles.color.replace('600', '500'), // Slightly less intense
        bgColor: baseStyles.bgColor.replace('50', '25'), // More subtle background
        borderColor: baseStyles.borderColor.replace('200', '150') // Softer border
      }
    }

    return baseStyles
  }
  
  const getRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const handleTestNotification = () => {
    const testNotifications = [
      // Test all notification types
      {
        id: `test-event-created-${Date.now()}`,
        type: 'EventCreated' as const,
        title: '🎉 New Event Available',
        message: 'A new workshop "Advanced React Patterns" has been created.',
        timestamp: Date.now(),
        read: false,
        data: { eventId: 123 }
      },
      {
        id: `test-registration-confirmed-${Date.now()}`,
        type: 'RegistrationConfirmed' as const, 
        title: '✅ Registration Confirmed',
        message: 'Your registration for "JavaScript Conference 2025" has been confirmed.',
        timestamp: Date.now(),
        read: false,
        data: { eventId: 456 }
      },
      {
        id: `test-event-cancelled-${Date.now()}`,
        type: 'EventCancelled' as const,
        title: '❌ Event Cancelled',
        message: 'The "React Workshop" has been cancelled due to low enrollment.',
        timestamp: Date.now(),
        read: false,
        data: { eventId: 789 }
      },
      {
        id: `test-event-reminder-${Date.now()}`,
        type: 'EventReminder' as const,
        title: '⏰ Event Reminder',
        message: 'Reminder: "React Workshop" starts in 2 hours.',
        timestamp: Date.now(),
        read: false,
        data: { eventId: 789, hoursUntilEvent: 2 }
      },
      {
        id: `test-capacity-reached-${Date.now()}`,
        type: 'EventCapacityReached' as const,
        title: '🏆 Event Full',
        message: 'The "JavaScript Conference 2025" has reached maximum capacity.',
        timestamp: Date.now(),
        read: false,
        data: { eventId: 456 }
      },
      {
        id: `test-registration-cancelled-${Date.now()}`,
        type: 'RegistrationCancelled' as const,
        title: '🚫 Registration Cancelled',
        message: 'Your registration for "Vue.js Workshop" has been cancelled.',
        timestamp: Date.now(),
        read: false,
        data: { eventId: 101 }
      }
    ]

    // Add all test notifications to see them
    testNotifications.forEach(notification => {
      console.log('Adding test notification:', notification)
      dispatch(addNotification(notification))
    })
  }

  const handleTestSignalR = async () => {
    console.log('=== SIGNALR COMPREHENSIVE TEST ===')
    console.log('1. Connection status:', signalRStatus)
    console.log('2. Is connection ready:', signalRService.isConnectionReady)
    
    if (signalRService.isConnectionReady) {
      try {
        console.log('3. Testing all SignalR features...')
        
        // Test user group joining
        await signalRService.joinUserGroup()
        console.log('✅ User group join successful')
        
        // Test notification reception
        await signalRService.testNotificationReception()
        console.log('✅ Test notification sent')
        
        // Add success notification
        dispatch(addNotification({
          id: `signalr-test-success-${Date.now()}`,
          type: 'success',
          title: '🔔 SignalR Test Successful',
          message: 'All SignalR features are working properly! You should receive real-time notifications.',
          timestamp: Date.now(),
          read: false
        }))
        
      } catch (error) {
        console.error('SignalR test failed:', error)
        dispatch(addNotification({
          id: `signalr-test-error-${Date.now()}`,
          type: 'error',
          title: '❌ SignalR Test Failed',
          message: `Connection test failed: ${error}. Please check your connection.`,
          timestamp: Date.now(),
          read: false
        }))
      }
    } else {
      console.log('3. SignalR not ready - attempting reconnection...')
      
      try {
        signalRService.reset()
        await new Promise(resolve => setTimeout(resolve, 1000))
        await signalRService.start()
        console.log('✅ Reconnection successful')
        
        dispatch(addNotification({
          id: `signalr-reconnect-${Date.now()}`,
          type: 'success',
          title: '🔄 SignalR Reconnected',
          message: 'Successfully reconnected to real-time notification service.',
          timestamp: Date.now(),
          read: false
        }))
      } catch (error) {
        console.error('❌ Reconnection failed:', error)
        dispatch(addNotification({
          id: `signalr-reconnect-error-${Date.now()}`,
          type: 'error',
          title: '🔌 SignalR Connection Failed',
          message: `Failed to establish real-time connection: ${error}`,
          timestamp: Date.now(),
          read: false
        }))
      }
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      console.log('Browser notification permission:', permission)
      
      dispatch(addNotification({
        id: `permission-${Date.now()}`,
        type: permission === 'granted' ? 'success' : 'warning',
        title: '🔔 Browser Notifications',
        message: permission === 'granted' 
          ? 'Browser notifications enabled! You\'ll receive desktop alerts for important events.'
          : 'Browser notifications disabled. Enable them in browser settings for desktop alerts.',
        timestamp: Date.now(),
        read: false
      }))

      // Test browser notification if granted
      if (permission === 'granted') {
        setTimeout(() => {
          new Notification('EventHub Test', {
            body: 'Browser notifications are working correctly!',
            icon: '/favicon.ico'
          })
        }, 1000)
      }
    }
  }

  const isConnected = signalRStatus === 'connected'
  const isConnecting = signalRStatus === 'connecting'

  const importantCount = notifications.filter(n => !n.read && ['error', 'warning'].includes(n.type)).length

  return (
    <Card className="w-96 max-h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center">
          <Icon name="Bell" className="mr-2 h-5 w-5" />
          Notifications
          
          {/* Connection status indicator */}
          <div 
            className={cn(
              "ml-2 w-2 h-2 rounded-full transition-colors",
              isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            )} 
            title={`SignalR: ${signalRStatus}`} 
          />
          
          {/* Notification counts */}
          <div className="flex gap-1 ml-2">
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="text-xs bg-red-500 text-white border-red-600 font-semibold shadow-sm"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            {importantCount > 0 && (
              <Badge 
                variant="outline" 
                className="text-xs bg-orange-500 text-white border-orange-600 font-semibold shadow-sm"
              >
                {importantCount} urgent
              </Badge>
            )}
          </div>
        </CardTitle>
        
        {/* Controls */}
        <div className="flex gap-1 flex-wrap">
          {/* Filter buttons */}
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs px-2"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs px-2"
              onClick={() => setFilter('unread')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Button>
            <Button
              variant={filter === 'important' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs px-2"
              onClick={() => setFilter('important')}
            >
              Important {importantCount > 0 && `(${importantCount})`}
            </Button>
          </div>
          
          {/* Action buttons */}
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} title="Mark all as read">
              <Icon name="CheckCheck" className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        {/* Connection Status Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Real-time Status</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleTestSignalR} className="text-xs px-2 py-1">
                Test
              </Button>
              <Button variant="outline" size="sm" onClick={handleTestNotification} className="text-xs px-2 py-1">
                Demo
              </Button>
              <Button variant="outline" size="sm" onClick={requestNotificationPermission} className="text-xs px-2 py-1">
                🔔
              </Button>
            </div>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className={cn(
                "font-mono font-medium",
                isConnected ? 'text-green-600' : isConnecting ? 'text-yellow-600' : 'text-red-600'
              )}>
                {signalRStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Service Ready:</span>
              <span className="font-mono font-medium">
                {signalRService.isConnectionReady ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Bell" className="mx-auto h-12 w-12 opacity-50 mb-4" />
            <p className="font-medium mb-1">
              {filter === 'unread' 
                ? 'No unread notifications' 
                : filter === 'important'
                ? 'No important notifications'
                : 'No notifications to show'
              }
            </p>
            <p className="text-xs text-gray-400">
              {filter === 'all' 
                ? 'When events happen, you\'ll see notifications here'
                : 'Switch to "All" to see your notification history'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const styles = getNotificationStyles(notification)
              const eventConfig = eventTypeConfigs[notification.type] || 
                                eventTypeConfigs[notification.title?.split(' ')[0]] // Try to match by title
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md group",
                    notification.read 
                      ? 'bg-gray-50 hover:bg-gray-100 border-gray-200' 
                      : `${styles.bgColor} hover:${styles.bgColor.replace('50', '100')} ${styles.borderColor}`,
                    "relative"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleNotificationClick(notification)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Notification: ${notification.title}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Notification icon */}
                      <div className="flex-shrink-0">
                        <Icon
                          name={getNotificationIcon(notification) as any}
                          className={cn("h-5 w-5 mt-0.5", styles.color)}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Title with event emoji if available */}
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "font-medium truncate",
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          )}>
                            {eventConfig?.emoji && (
                              <span className="mr-2">{eventConfig.emoji}</span>
                            )}
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
                          )}
                        </div>
                        
                        {/* Message */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        
                        {/* Event type description */}
                        {eventConfig?.description && (
                          <p className="text-xs text-gray-500 italic mb-2">
                            {eventConfig.description}
                          </p>
                        )}
                        
                        {/* Footer with time and action hint */}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {getRelativeTime(notification.timestamp)}
                          </p>
                          
                          {(notification.actionUrl || notification.data?.eventId) && (
                            <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view →
                            </p>
                          )}
                        </div>
                        
                        {/* Additional data preview */}
                        {notification.data && Object.keys(notification.data).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.data.eventTitle && (
                              <div>Event: {notification.data.eventTitle}</div>
                            )}
                            {notification.data.hoursUntilEvent && (
                              <div>Starts in: {notification.data.hoursUntilEvent}h</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          className="h-8 w-8 p-0"
                          title="Mark as read"
                        >
                          <Icon name="Check" className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(notification.id)
                        }}
                        className="h-8 w-8 p-0"
                        title="Remove notification"
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}