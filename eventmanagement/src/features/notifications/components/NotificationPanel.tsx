import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, Icon } from '@/components/atoms'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { markAsRead, markAllAsRead, removeNotification, addNotification } from '@/features/notifications/notificationSlice'
import { getTokenFromCookie } from '@/shared/utils/cookies'
import { signalRService } from '@/shared/lib/signalr'

export const NotificationPanel = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { notifications, unreadCount, connectionStatus } = useAppSelector(state => state.notifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  // ✅ Get connection status directly from service
  const [signalRStatus, setSignalRStatus] = useState(signalRService.connectionStatus)

  // ✅ Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalRStatus(signalRService.connectionStatus)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Add debugging info
  console.log('SignalR Status:', { 
    connectionStatus, 
    signalRStatus,
    isConnectionReady: signalRService.isConnectionReady 
  })
  console.log('Notifications:', notifications)

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.read
  )

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

    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    } else if (notification.data?.eventId) {
      navigate(`/events/${notification.data.eventId}`)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'CheckCircle'
      case 'warning': return 'AlertTriangle'
      case 'error': return 'AlertCircle'
      default: return 'Info'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-blue-600'
    }
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
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification',
      timestamp: Date.now(),
      read: false
    }))
  }

  const handleTestSignalR = async () => {
    console.log('=== SIGNALR DEBUG TEST ===')
    console.log('1. Connection status:', signalRStatus)
    console.log('2. Is connection ready:', signalRService.isConnectionReady)
    console.log('3. Auth token available:', !!getTokenFromCookie('accessToken'))
    
    if (signalRService.isConnectionReady) {
      console.log('4. SignalR is ready - testing features...')
      
      try {
        // Test user group joining
        await signalRService.joinUserGroup()
        console.log('5. ✅ User group join successful')
        
        // Test notification reception
        await signalRService.testNotificationReception()
        console.log('6. ✅ Test notification sent')
        
        // Add a manual test notification
        dispatch(addNotification({
          id: `test-${Date.now()}`,
          type: 'success',
          title: 'SignalR Test Successful',
          message: 'Connection is working properly!',
          timestamp: Date.now(),
          read: false
        }))
        
      } catch (error) {
        console.error('SignalR test failed:', error)
      }
    } else {
      console.log('4. SignalR not ready - attempting reconnection...')
      
      try {
        signalRService.reset()
        await new Promise(resolve => setTimeout(resolve, 1000))
        await signalRService.start()
        console.log('5. ✅ Reconnection successful')
      } catch (error) {
        console.error('5. ❌ Reconnection failed:', error)
      }
    }
  }

  // ✅ Determine connection status for UI
  const isConnected = signalRStatus === 'connected'
  const isConnecting = signalRStatus === 'connecting'

  // ✅ Add method to request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      console.log('Browser notification permission:', permission)
    }
  }

  return (
    <Card className="w-96">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Icon name="Bell" className="mr-2 h-5 w-5" />
          Notifications
          {/* Connection status indicator */}
          <div className={`ml-2 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
          }`} title={`SignalR: ${signalRStatus}`} />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            {filter === 'all' ? 'Unread Only' : 'Show All'}
          </Button>
          
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleTestNotification}>
            Test
          </Button>
          <Button variant="outline" size="sm" onClick={handleTestSignalR}>
            Test SignalR
          </Button>
          <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
            Enable Browser Notifications
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Bell" className="mx-auto h-12 w-12 opacity-50 mb-4" />
            <p>
              {filter === 'unread' 
                ? 'No unread notifications' 
                : 'No notifications to show'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  notification.read 
                    ? 'bg-gray-50 hover:bg-gray-100' 
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
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
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon
                      name={getNotificationIcon(notification.type) as any}
                      className={`h-5 w-5 mt-0.5 ${getNotificationColor(notification.type)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {getRelativeTime(notification.timestamp)}
                        </p>
                        {(notification.actionUrl || notification.data?.eventId) && (
                          <p className="text-xs text-blue-600">Click to view →</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}