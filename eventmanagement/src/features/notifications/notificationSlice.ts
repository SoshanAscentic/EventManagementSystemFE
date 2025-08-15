import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NotificationSound } from '@/shared/utils/notificationSound'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: number
  read: boolean
  data?: any
  actionUrl?: string
  persistent?: boolean
  showInToast?: boolean
  toastDismissed?: boolean // NEW: Track if toast was dismissed (but notification still unread)
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  connectionStatus: 'disconnected',
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = {
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
        timestamp: action.payload.timestamp || Date.now(),
        read: action.payload.read || false,
      }
      
      state.notifications.unshift(notification)
      state.unreadCount += 1
      
      // Play notification sound
      NotificationSound.playNotificationByType(notification.type)
    },
    
    // NEW: Hide toast without marking as read
    hideToast: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.toastDismissed = true
        console.log('📦 Redux - Toast hidden (notification still unread):', notification.title)
      }
    },
    
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        notification.toastDismissed = true // Also hide toast when marked as read
        state.unreadCount = Math.max(0, state.unreadCount - 1)
        console.log('📦 Redux - Marked as read:', notification.title)
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true
          notification.toastDismissed = true
        }
      })
      state.unreadCount = 0
      console.log('📦 Redux - Marked all as read')
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) {
          state.unreadCount -= 1
        }
        state.notifications.splice(index, 1)
        console.log('📦 Redux - Removed notification:', notification.title)
      }
    },
    
    setConnectionStatus: (state, action: PayloadAction<NotificationState['connectionStatus']>) => {
      state.connectionStatus = action.payload
      console.log('📦 Redux - Connection status:', action.payload)
    },

    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
      console.log('📦 Redux - Cleared all notifications')
    },
  },
})

export const {
  addNotification,
  hideToast,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setConnectionStatus,
  clearAllNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer