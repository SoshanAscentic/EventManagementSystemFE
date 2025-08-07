import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { markAsRead, markAllAsRead, removeNotification } from '@/features/notifications/notificationSlice'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/atoms'
import { ScrollArea } from '@/components/ui/scroll-area'

// Notification type icons and colors
const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'EventCreated':
      return { icon: 'Calendar', color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'EventUpdated':
      return { icon: 'Edit3', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'EventCancelled':
      return { icon: 'X', color: 'text-red-600', bgColor: 'bg-red-50' }
    case 'RegistrationConfirmed':
      return { icon: 'CheckCircle', color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'RegistrationCancelled':
      return { icon: 'XCircle', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    case 'EventReminder':
      return { icon: 'Clock', color: 'text-purple-600', bgColor: 'bg-purple-50' }
    case 'EventCapacityReached':
      return { icon: 'Users', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    case 'MoreSpotsAvailable':
      return { icon: 'UserPlus', color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'LiveEventUpdate':
      return { icon: 'Radio', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'success':
      return { icon: 'CheckCircle', color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'warning':
      return { icon: 'AlertTriangle', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    case 'error':
      return { icon: 'AlertCircle', color: 'text-red-600', bgColor: 'bg-red-50' }
    case 'info':
      return { icon: 'Info', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'RegistrationMilestone':
      return { icon: 'Trophy', color: 'text-purple-600', bgColor: 'bg-purple-50' }
    case 'SpotAvailable':
      return { icon: 'UserPlus', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    case 'HighDemand':
      return { icon: 'TrendingUp', color: 'text-red-600', bgColor: 'bg-red-50' }
    default:
      return { icon: 'Bell', color: 'text-gray-600', bgColor: 'bg-gray-50' }
  }
}

interface NotificationItemProps {
  notification: {
    id: string
    title: string
    message: string
    type: string
    timestamp: number // Changed from createdAt to timestamp
    read: boolean     // Changed from isRead to read
    actionUrl?: string
    data?: any        // Add this to match Redux interface
  }
  onMarkAsRead: (id: string) => void
  onClear: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onClear
}) => {
  const style = getNotificationStyle(notification.type)
  // Fix the date formatting to use timestamp instead of createdAt
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })

  const handleClick = () => {
    if (!notification.read) { // Changed from isRead to read
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div 
      className={`group relative p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
        notification.read  // Changed from isRead to read
          ? 'border-transparent opacity-75' 
          : 'border-blue-500 bg-blue-50/30'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div className={`flex-shrink-0 p-2 rounded-full ${style.bgColor}`}>
          <Icon name={style.icon as any} className={`h-4 w-4 ${style.color}`} />
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${
                notification.read ? 'text-gray-700' : 'text-gray-900' // Changed from isRead to read
              }`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${
                notification.read ? 'text-gray-500' : 'text-gray-700' // Changed from isRead to read
              }`}>
                {notification.message}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-xs text-gray-400">{timeAgo}</span>
                {!notification.read && ( // Changed from isRead to read
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    New
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {notification.actionUrl && (
                <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0">
                  <Link to={notification.actionUrl}>
                    <Icon name="ExternalLink" className="h-3 w-3" />
                  </Link>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onClear(notification.id)
                }}
              >
                <Icon name="X" className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount } = useAppSelector(state => state.notifications)
  
  const [isOpen, setIsOpen] = useState(false)

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleClearAll = () => {
    // Clear all notifications from Redux
    notifications.forEach(notification => {
      dispatch(removeNotification(notification.id))
    })
    setIsOpen(false)
  }

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleClearNotification = (id: string) => {
    dispatch(removeNotification(id))
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Icon name="Bell" className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">Notifications</h3>
              {/* {!isConnected && (
                <Badge variant="outline" className="text-xs">
                  <Icon name="WifiOff" className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )} */}
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex items-center space-x-2 mt-3">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <Icon name="Check" className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <Icon name="Trash2" className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Bell" className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-sm text-gray-500">When you have notifications, they'll appear here.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onClear={handleClearNotification}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button variant="ghost" size="sm" className="w-full text-sm" asChild>
              <Link to="/notifications">
                View all notifications
              </Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}