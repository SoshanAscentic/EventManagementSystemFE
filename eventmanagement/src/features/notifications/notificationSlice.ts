import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
        id: action.payload.id || Date.now().toString(),
        type: action.payload.type || 'info',
        title: action.payload.title || 'Notification',
        message: action.payload.message || 'You have a new notification',
        timestamp: action.payload.timestamp || Date.now(),
        read: false,
        data: action.payload.data || {},
        actionUrl: action.payload.actionUrl,
        persistent: action.payload.persistent ?? true,
        showInToast: action.payload.showInToast ?? true,
        toastDismissed: false, // NEW: Initially false
      }

      console.log('📦 Redux - Adding notification:', notification)

      state.notifications.unshift(notification)

      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }

      state.unreadCount += 1

      console.log('📦 Redux - State after adding notification:', {
        total: state.notifications.length,
        unread: state.unreadCount,
        latest: notification.title
      })
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