import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  data?: any
  actionUrl?: string
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
        read: false,
      }

      // Add to beginning of array (newest first)
      state.notifications.unshift(notification)

      // Limit to last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }

      // Update unread count
      state.unreadCount += 1
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) {
          state.unreadCount -= 1
        }
        state.notifications.splice(index, 1)
      }
    },
    setConnectionStatus: (state, action: PayloadAction<NotificationState['connectionStatus']>) => {
      state.connectionStatus = action.payload
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setConnectionStatus,
} = notificationSlice.actions

export default notificationSlice.reducer