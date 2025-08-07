// import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// interface Notification {
//   id: string
//   message: string
//   read: boolean
// }

// interface NotificationsState {
//   notifications: Notification[]
//   connectionStatus: 'connected' | 'disconnected' | 'connecting'
// }

// const initialState: NotificationsState = {
//   notifications: [],
//   connectionStatus: 'disconnected',
// }

// const notificationSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     addNotification: (state, action: PayloadAction<Omit<Notification, 'read'>>) => {
//       state.notifications.push({ ...action.payload, read: false })
//     },
//     markAsRead: (state, action: PayloadAction<string>) => {
//       const notification = state.notifications.find(notif => notif.id === action.payload)
//       if (notification) {
//         notification.read = true
//       }
//     },
//     markAllAsRead: state => {
//       state.notifications.forEach(notif => {
//         notif.read = true
//       })
//     },
//     removeNotification: (state, action: PayloadAction<string>) => {
//       state.notifications = state.notifications.filter(notif => notif.id !== action.payload)
//     },
//     clearNotifications: state => {
//       state.notifications = []
//     },
//     setConnectionStatus: (state, action: PayloadAction<'connected' | 'disconnected' | 'connecting'>) => {
//       state.connectionStatus = action.payload
//     },
//   },
// })

// export const { 
//   addNotification, 
//   markAsRead, 
//   markAllAsRead, 
//   removeNotification, 
//   clearNotifications,
//   setConnectionStatus 
// } = notificationSlice.actions

// export default notificationSlice.reducer