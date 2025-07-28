import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, Icon } from '@/components/atoms'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { markAsRead, markAllAsRead, removeNotification } from '@/features/notifications/notificationSlice'

export const NotificationPanel = () => {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount } = useAppSelector(state => state.notifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

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

  return (
    <Card className="w-96">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Icon name="Bell" className="mr-2 h-5 w-5" />
          Notifications
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
        </div>
      </CardHeader>
      
      <CardContent className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Bell" className="mx-auto h-12 w-12 opacity-50 mb-4" />
            <p>No notifications to show</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon
                      name={getNotificationIcon(notification.type) as any}
                      className={`h-5 w-5 mt-0.5 ${getNotificationColor(notification.type)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Icon name="Check" className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(notification.id)}
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