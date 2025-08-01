import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { toast } from 'sonner' // or your preferred toast library

// Notification Types based on your documentation
export type NotificationType = 
  | 'EventCreated'
  | 'EventUpdated' 
  | 'EventCancelled'
  | 'RegistrationConfirmed'
  | 'RegistrationCancelled'
  | 'EventReminder'
  | 'EventCapacityReached'

export interface NotificationData {
  id: string
  title: string
  message: string
  type: NotificationType
  createdAt: string
  userId?: number
  userEmail?: string
  actionUrl?: string
  data?: Record<string, any>
  isRead?: boolean
}

interface NotificationContextType {
  notifications: NotificationData[]
  unreadCount: number
  isConnected: boolean
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotification: (notificationId: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
  hubUrl?: string
  userId?: number
  userRole?: string
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  hubUrl = '/notificationHub',
  userId,
  userRole
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Initialize SignalR connection
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => {
              // Get your auth token here
              return localStorage.getItem('authToken') || ''
            }
          })
          .withAutomaticReconnect([0, 2000, 10000, 30000])
          .configureLogging(signalR.LogLevel.Information)
          .build()

        connectionRef.current = connection

        // Handle connection events
        connection.onreconnecting(() => {
          console.log('SignalR reconnecting...')
          setIsConnected(false)
        })

        connection.onreconnected(() => {
          console.log('SignalR reconnected')
          setIsConnected(true)
        })

        connection.onclose(() => {
          console.log('SignalR connection closed')
          setIsConnected(false)
        })

        // Register notification handlers
        connection.on('ReceiveNotification', handleNotification)

        await connection.start()
        console.log('SignalR Connected')
        setIsConnected(true)

        // Join user-specific group if userId is provided
        if (userId) {
          await connection.invoke('JoinUserGroup', userId.toString())
        }

        // Join role-specific group if userRole is provided
        if (userRole) {
          await connection.invoke('JoinRoleGroup', userRole)
        }

      } catch (error) {
        console.error('SignalR Connection Error:', error)
        // Retry connection after 5 seconds
        setTimeout(initializeConnection, 5000)
      }
    }

    initializeConnection()

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop()
      }
    }
  }, [hubUrl, userId, userRole])

  // Handle incoming notifications
  const handleNotification = useCallback((notification: NotificationData) => {
    console.log('Received notification:', notification)
    
    // Add notification to state
    setNotifications(prev => [
      { ...notification, isRead: false },
      ...prev.slice(0, 49) // Keep only last 50 notifications
    ])

    // Show appropriate toast based on notification type
    showNotificationToast(notification)
  }, [])

  // Show toast notification
  const showNotificationToast = (notification: NotificationData) => {
    const toastOptions = {
      action: notification.actionUrl ? {
        label: 'View',
        onClick: () => window.location.href = notification.actionUrl!
      } : undefined
    }

    switch (notification.type) {
      case 'EventCreated':
        toast.success(notification.title, {
          description: notification.message,
          ...toastOptions
        })
        break
      case 'EventCancelled':
        toast.error(notification.title, {
          description: notification.message,
          ...toastOptions
        })
        break
      case 'EventUpdated':
        toast.info(notification.title, {
          description: notification.message,
          ...toastOptions
        })
        break
      case 'RegistrationConfirmed':
        toast.success(notification.title, {
          description: notification.message,
          ...toastOptions
        })
        break
      case 'RegistrationCancelled':
        toast.warning(notification.title, {
          description: notification.message,
          ...toastOptions
        })
        break
      case 'EventReminder':
        toast('⏰ ' + notification.title, {
          description: notification.message,
          ...toastOptions
        })
        break
      case 'EventCapacityReached':
        toast.warning(notification.title, {
          description: notification.message,
          ...toastOptions
        })
        break
      default:
        toast(notification.title, {
          description: notification.message,
          ...toastOptions
        })
    }
  }

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }, [])

  // Clear specific notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}