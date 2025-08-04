import * as signalR from '@microsoft/signalr'
import { store } from '@/app/store/store'
import { addNotification, setConnectionStatus } from '@/features/notifications/notificationSlice'
import { getTokenFromCookie } from '@/features/auth/api/authApi'
import { eventsApi } from '@/features/events/api/eventsApi'
import { registrationsApi } from '@/features/registrations/api/registrationsApi'

interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  userId?: number
  userEmail?: string
  actionUrl?: string
  data?: Record<string, any>
}

class RobustSignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnected = false
  private isConnecting = false
  private connectionPromise: Promise<void> | null = null
  private shouldConnect = true
  private lastConnectionAttempt = 0
  private readonly CONNECTION_THROTTLE = 2000 // Reduced from 5000ms to 2000ms
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private isPageVisible = true
  private networkOnline = true
  private tokenRefreshInProgress = false

  // Enhanced reconnection strategy - more frequent attempts
  private readonly RECONNECT_DELAYS = [
    0,      // Immediate
    1000,   // 1 second
    2000,   // 2 seconds  
    5000,   // 5 seconds
    10000,  // 10 seconds
    15000,  // 15 seconds
    30000,  // 30 seconds
    60000,  // 1 minute
    120000, // 2 minutes
    300000  // 5 minutes
  ]

  constructor() {
    this.setupBrowserEventListeners()
  }

  private setupBrowserEventListeners(): void {
    // Handle browser tab visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isPageVisible = !document.hidden
        console.log(`SignalR: Page visibility changed: ${this.isPageVisible ? 'visible' : 'hidden'}`)
        
        if (this.isPageVisible && !this.isConnected && this.shouldConnect) {
          console.log('SignalR: Page became visible, attempting reconnection...')
          setTimeout(() => this.start(), 1000) // Small delay to ensure page is fully active
        }
      })
    }

    // Handle network online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.networkOnline = true
        console.log('SignalR: Network came online, attempting reconnection...')
        if (this.shouldConnect) {
          setTimeout(() => this.start(), 500)
        }
      })

      window.addEventListener('offline', () => {
        this.networkOnline = false
        console.log('SignalR: Network went offline')
        store.dispatch(setConnectionStatus('disconnected'))
      })

      // Initialize network state
      this.networkOnline = navigator.onLine
    }

    // Handle browser beforeunload to gracefully disconnect
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.shouldConnect = false
        if (this.connection) {
          this.connection.stop().catch(() => {})
        }
      })
    }
  }

  async start(): Promise<void> {
    // Check if conditions are right for connection
    if (!this.shouldConnect) {
      console.log('SignalR: Connection disabled')
      return
    }

    if (!this.networkOnline) {
      console.log('SignalR: Network offline, skipping connection attempt')
      return
    }

    if (!this.isPageVisible) {
      console.log('SignalR: Page not visible, skipping connection attempt')
      return
    }

    // Throttle connection attempts with exponential backoff
    const now = Date.now()
    const minDelay = this.CONNECTION_THROTTLE * Math.pow(2, Math.min(this.reconnectAttempts, 5))
    
    if (now - this.lastConnectionAttempt < minDelay) {
      console.log(`SignalR: Throttling connection attempt (${minDelay}ms cooldown)`)
      return
    }
    this.lastConnectionAttempt = now

    // Return existing connection attempt if in progress
    if (this.connectionPromise) {
      console.log('SignalR: Connection attempt already in progress')
      return this.connectionPromise
    }

    // Skip if already connected
    if (this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR: Already connected')
      this.reconnectAttempts = 0 // Reset counter on successful connection
      return Promise.resolve()
    }

    // Create and store the connection promise
    this.connectionPromise = this.connectInternal()
    
    try {
      await this.connectionPromise
      this.reconnectAttempts = 0 // Reset on successful connection
    } catch (error) {
      this.reconnectAttempts++
      console.warn(`SignalR: Connection attempt ${this.reconnectAttempts} failed:`, error)
      
      // Give up after max attempts
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('SignalR: Max reconnection attempts reached, giving up')
        this.shouldConnect = false
        store.dispatch(addNotification({
          id: `signalr-max-attempts-${Date.now()}`,
          type: 'error',
          title: 'Connection Failed',
          message: 'Could not establish real-time connection. Please refresh the page.',
          timestamp: Date.now(),
          read: false
        }))
      }
    } finally {
      this.connectionPromise = null
    }
  }

  private async connectInternal(): Promise<void> {
    if (!this.shouldConnect || this.isConnecting) return

    this.isConnecting = true
    console.log(`SignalR: Starting connection attempt ${this.reconnectAttempts + 1}...`)
    store.dispatch(setConnectionStatus('connecting'))

    try {
      // Get fresh token with retry logic
      const token = await this.getValidToken()
      
      if (!token) {
        console.log('SignalR: No valid authentication token available')
        this.isConnecting = false
        store.dispatch(setConnectionStatus('disconnected'))
        return
      }

      // Stop existing connection
      if (this.connection) {
        try {
          await this.connection.stop()
        } catch (stopError) {
          console.warn('SignalR: Error stopping existing connection:', stopError)
        }
        this.connection = null
      }

      if (!this.shouldConnect) {
        this.isConnecting = false
        return
      }

      // Create new connection with enhanced configuration
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL || 'https://localhost:7026'}/notificationHub`, {
          accessTokenFactory: async () => {
            // Always get fresh token for each request
            const freshToken = await this.getValidToken()
            console.log('SignalR: Using token for request:', freshToken ? 'Present' : 'Missing')
            return freshToken || ''
          },
          withCredentials: true,
          // Enhanced transport configuration with proper fallbacks
          transport: signalR.HttpTransportType.WebSockets | 
                    signalR.HttpTransportType.ServerSentEvents | 
                    signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          // Add timeout configurations
          timeout: 30000, // 30 seconds
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Custom reconnection strategy
            const delay = this.RECONNECT_DELAYS[Math.min(retryContext.previousRetryCount, this.RECONNECT_DELAYS.length - 1)]
            console.log(`SignalR: Next reconnection attempt in ${delay}ms (attempt ${retryContext.previousRetryCount + 1})`)
            return delay
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()
  
      this.setupEventHandlers()

      if (!this.shouldConnect) {
        this.isConnecting = false
        if (this.connection) {
          this.connection = null
        }
        return
      }

      console.log('SignalR: Attempting to start connection...')
      await this.connection.start()
      
      if (!this.shouldConnect) {
        await this.connection.stop()
        this.connection = null
        this.isConnecting = false
        return
      }

      console.log('✅ SignalR: Connected successfully')
      this.isConnecting = false
      this.isConnected = true
      this.reconnectAttempts = 0
      
      store.dispatch(setConnectionStatus('connected'))
      
      // Join user-specific group
      await this.joinUserGroup()
      
      // Show success notification on reconnection
      if (this.reconnectAttempts > 0) {
        store.dispatch(addNotification({
          id: `signalr-reconnected-${Date.now()}`,
          type: 'success',
          title: 'Reconnected',
          message: 'Real-time connection restored successfully.',
          timestamp: Date.now(),
          read: false
        }))
      }
      
    } catch (error) {
      console.error('SignalR: Connection failed:', error)
      this.isConnecting = false
      this.isConnected = false
      store.dispatch(setConnectionStatus('disconnected'))
      
      // Show user-friendly error message
      if (this.reconnectAttempts === 0) { // Only show on first failure
        store.dispatch(addNotification({
          id: `signalr-connection-error-${Date.now()}`,
          type: 'warning',
          title: 'Connection Issue',
          message: 'Real-time notifications temporarily unavailable. Retrying automatically...',
          timestamp: Date.now(),
          read: false
        }))
      }
      
      throw error
    }
  }

  private async getValidToken(): Promise<string | null> {
    try {
      let token = getTokenFromCookie('accessToken')
      
      if (!token) {
        console.log('SignalR: No access token found')
        return null
      }

      // Check if token is about to expire (within 5 minutes)
      const tokenPayload = this.parseJwtPayload(token)
      if (tokenPayload && tokenPayload.exp) {
        const expirationTime = tokenPayload.exp * 1000 // Convert to milliseconds
        const currentTime = Date.now()
        const timeUntilExpiry = expirationTime - currentTime
        
        // If token expires within 5 minutes, try to refresh
        if (timeUntilExpiry < 5 * 60 * 1000 && !this.tokenRefreshInProgress) {
          console.log('SignalR: Token expires soon, attempting refresh...')
          token = await this.refreshToken() || token
        }
      }

      return token
    } catch (error) {
      console.warn('SignalR: Error getting valid token:', error)
      return getTokenFromCookie('accessToken')
    }
  }

  private parseJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.warn('SignalR: Error parsing JWT payload:', error)
      return null
    }
  }

  private async refreshToken(): Promise<string | null> {
    if (this.tokenRefreshInProgress) {
      console.log('SignalR: Token refresh already in progress')
      return null
    }

    this.tokenRefreshInProgress = true
    
    try {
      const refreshToken = getTokenFromCookie('refreshToken')
      if (!refreshToken) {
        console.log('SignalR: No refresh token available')
        return null
      }

      // Call your refresh endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7026'}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Store new tokens
          document.cookie = `accessToken=${data.data.accessToken}; path=/; secure; samesite=lax; expires=${new Date(data.data.expiresAt).toUTCString()}`
          
          const refreshExpiry = new Date()
          refreshExpiry.setDate(refreshExpiry.getDate() + 7)
          document.cookie = `refreshToken=${data.data.refreshToken}; path=/; secure; samesite=lax; expires=${refreshExpiry.toUTCString()}`
          
          console.log('SignalR: Token refreshed successfully')
          return data.data.accessToken
        }
      }
      
      console.log('SignalR: Token refresh failed')
      return null
    } catch (error) {
      console.error('SignalR: Error refreshing token:', error)
      return null
    } finally {
      this.tokenRefreshInProgress = false
    }
  }

  async joinUserGroup(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('SignalR: Cannot join user group - not connected')
      return
    }

    try {
      const userGroupMethods = ['JoinUserGroup', 'JoinGroup', 'Subscribe', 'SubscribeToNotifications']
      
      for (const method of userGroupMethods) {
        try {
          console.log(`SignalR: Attempting to join user group via ${method}`)
          await this.connection.invoke(method)
          console.log(`✅ SignalR: Successfully joined user group via ${method}`)
          return
        } catch (error) {
          console.log(`SignalR: Method ${method} not available:`, error)
        }
      }

      console.warn('SignalR: No valid method found for joining user group')
    } catch (error) {
      console.error('SignalR: Failed to join user group:', error)
    }
  }

  async joinEventGroup(eventId: number): Promise<void> {
    await this.waitForConnection()
    
    if (!this.isConnectionReady) {
      console.log('SignalR: Cannot join event group - not connected')
      return
    }

    try {
      await this.connection!.invoke('JoinEventGroup', eventId)
      console.log(`✅ SignalR: Joined event group ${eventId}`)
    } catch (error) {
      console.warn('SignalR: Failed to join event group:', error)
    }
  }

  async leaveEventGroup(eventId: number): Promise<void> {
    if (!this.isConnectionReady) return

    try {
      await this.connection!.invoke('LeaveEventGroup', eventId)
      console.log(`SignalR: Left event group ${eventId}`)
    } catch (error) {
      console.warn('SignalR: Failed to leave event group:', error)
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return

    console.log('SignalR: Setting up event handlers')

    // Enhanced connection state management
    this.connection.onclose((error) => {
      console.log('🔴 SignalR: Connection closed', error)
      this.isConnected = false
      store.dispatch(setConnectionStatus('disconnected'))
      
      // If we should stay connected, attempt reconnection
      if (this.shouldConnect && this.networkOnline && this.isPageVisible) {
        console.log('SignalR: Connection closed unexpectedly, will attempt reconnection...')
      }
    })

    this.connection.onreconnecting((error) => {
      console.log('🟡 SignalR: Reconnecting...', error)
      this.isConnected = false
      store.dispatch(setConnectionStatus('connecting'))
    })

    this.connection.onreconnected((connectionId) => {
      console.log('🟢 SignalR: Reconnected successfully', connectionId)
      this.isConnected = true
      this.reconnectAttempts = 0
      store.dispatch(setConnectionStatus('connected'))
      
      // Rejoin user group after reconnection
      this.joinUserGroup().catch(console.warn)
      
      // Show reconnection success
      store.dispatch(addNotification({
        id: `signalr-auto-reconnected-${Date.now()}`,
        type: 'success',
        title: 'Reconnected',
        message: 'Real-time connection automatically restored.',
        timestamp: Date.now(),
        read: false
      }))
    })

    // Enhanced notification event listeners
    const notificationEvents = [
      'ReceiveNotification',
      'NotificationSent',
      'EventNotification', 
      'UserNotification',
      'BroadcastNotification',
      'AdminNotification',
      'EventCreated',
      'EventUpdated', 
      'EventCancelled',
      'RegistrationConfirmed',
      'RegistrationCancelled',
      'EventReminder',
      'EventCapacityReached'
    ]

    notificationEvents.forEach(eventName => {
      this.connection!.on(eventName, (notification: NotificationData) => {
        console.log(`🔔 SignalR: Received ${eventName}:`, notification)
        this.handleNotification(notification, eventName)
      })
    })

    // Test events
    this.connection.on('Ping', () => {
      console.log('SignalR: Received ping')
    })
  }

  private handleNotification(notification: NotificationData, eventType?: string): void {
    console.log('🔔 SignalR: Processing notification:', notification, 'Event Type:', eventType)

    try {
      const frontendNotification = {
        id: notification.id || `${eventType}-${Date.now()}`,
        type: this.mapNotificationType(notification.type || eventType || 'info'),
        title: notification.title || this.getDefaultTitle(notification.type || eventType),
        message: notification.message || 'You have a new notification',
        timestamp: notification.createdAt ? new Date(notification.createdAt).getTime() : Date.now(),
        read: false,
        data: notification.data || {},
        actionUrl: notification.actionUrl
      }

      console.log('🔔 SignalR: Dispatching frontend notification:', frontendNotification)

      store.dispatch(addNotification(frontendNotification))
      this.showBrowserNotification(frontendNotification)
      this.handleSpecificNotificationActions(notification, eventType)

    } catch (error) {
      console.error('SignalR: Error processing notification:', error)
    }
  }

  private mapNotificationType(type: string): 'info' | 'success' | 'warning' | 'error' {
    const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
      'EventCreated': 'success',
      'RegistrationConfirmed': 'success',
      'success': 'success',
      'EventUpdated': 'warning',
      'EventReminder': 'warning',
      'EventCapacityReached': 'warning',
      'warning': 'warning',
      'EventCancelled': 'error',
      'RegistrationCancelled': 'error',
      'error': 'error',
      'info': 'info'
    }
    return typeMap[type] || 'info'
  }

  private getDefaultTitle(type?: string): string {
    const titleMap: Record<string, string> = {
      'EventCreated': 'New Event Available',
      'EventUpdated': 'Event Updated',
      'EventCancelled': 'Event Cancelled',
      'RegistrationConfirmed': 'Registration Confirmed',
      'RegistrationCancelled': 'Registration Cancelled', 
      'EventReminder': 'Event Reminder',
      'EventCapacityReached': 'Event Full'
    }
    return titleMap[type || ''] || 'New Notification'
  }

  private showBrowserNotification(notification: any): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
          badge: '/favicon.ico',
          silent: false,
          requireInteraction: notification.type === 'error'
        })

        if (notification.type !== 'error') {
          setTimeout(() => browserNotification.close(), 5000)
        }

        browserNotification.onclick = () => {
          window.focus()
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl
          }
          browserNotification.close()
        }
      } catch (error) {
        console.warn('Failed to show browser notification:', error)
      }
    }
  }

  private handleSpecificNotificationActions(notification: NotificationData, eventType?: string): void {
    const type = notification.type || eventType
    const { data } = notification

    console.log(`SignalR: Handling specific actions for ${type}`, data)

    switch (type) {
      case 'EventCreated':
        this.invalidateEventsCache()
        this.showSuccessToast('A new event is now available for registration!')
        break
      
      case 'EventUpdated':
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        this.invalidateEventsCache()
        this.showWarningToast('An event you\'re registered for has been updated.')
        break
      
      case 'EventCancelled':
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        this.invalidateEventsCache()
        this.invalidateRegistrationsCache()
        this.showErrorToast('An event you were registered for has been cancelled.')
        break
      
      case 'RegistrationConfirmed':
        this.invalidateRegistrationsCache()
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
          this.invalidateEventRegistrationsCache(data.eventId)
        }
        this.showSuccessToast('Your event registration has been confirmed!')
        break
      
      case 'RegistrationCancelled':
        this.invalidateRegistrationsCache()
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
          this.invalidateEventRegistrationsCache(data.eventId)
        }
        this.showWarningToast('Your event registration has been cancelled.')
        break
      
      case 'EventReminder':
        const hoursUntil = data?.hoursUntilEvent
        const timeText = hoursUntil ? 
          (hoursUntil < 24 ? `${hoursUntil} hours` : `${Math.ceil(hoursUntil / 24)} days`) : 
          'soon'
        this.showInfoToast(`Reminder: Your event starts ${timeText}!`)
        break
      
      case 'EventCapacityReached':
        this.showWarningToast('An event has reached full capacity.')
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        break
    }
  }

  // Toast notification helpers
  private showSuccessToast(message: string): void {
    store.dispatch(addNotification({
      id: `toast-success-${Date.now()}`,
      type: 'success',
      title: 'Success',
      message,
      timestamp: Date.now(),
      read: false
    }))
  }

  private showWarningToast(message: string): void {
    store.dispatch(addNotification({
      id: `toast-warning-${Date.now()}`,
      type: 'warning', 
      title: 'Notice',
      message,
      timestamp: Date.now(),
      read: false
    }))
  }

  private showErrorToast(message: string): void {
    store.dispatch(addNotification({
      id: `toast-error-${Date.now()}`,
      type: 'error',
      title: 'Important',
      message,
      timestamp: Date.now(),
      read: false
    }))
  }

  private showInfoToast(message: string): void {
    store.dispatch(addNotification({
      id: `toast-info-${Date.now()}`,
      type: 'info',
      title: 'Information',
      message,
      timestamp: Date.now(),
      read: false
    }))
  }

  // Cache invalidation methods
  private invalidateEventsCache(): void {
    console.log('SignalR: Invalidating events cache')
    store.dispatch(eventsApi.util.invalidateTags([
      { type: 'Event', id: 'LIST' },
      { type: 'Event', id: 'UPCOMING' }
    ]))
  }

  private invalidateEventCache(eventId: number): void {
    console.log(`SignalR: Invalidating event ${eventId} cache`)
    store.dispatch(eventsApi.util.invalidateTags([
      { type: 'Event', id: eventId },
      { type: 'Event', id: 'LIST' },
      { type: 'Event', id: 'UPCOMING' }
    ]))
  }

  private invalidateRegistrationsCache(): void {
    console.log('SignalR: Invalidating registrations cache')
    store.dispatch(registrationsApi.util.invalidateTags([
      { type: 'Registration', id: 'LIST' }
    ]))
  }

  private invalidateEventRegistrationsCache(eventId: number): void {
    console.log(`SignalR: Invalidating event ${eventId} registrations cache`)
    store.dispatch(registrationsApi.util.invalidateTags([
      { type: 'Registration', id: `EVENT_${eventId}` },
      { type: 'Registration', id: 'LIST' }
    ]))
  }

  async stop(): Promise<void> {
    console.log('SignalR: Stopping service...')
    
    this.shouldConnect = false
    this.connectionPromise = null
    this.isConnecting = false
    this.isConnected = false
    this.reconnectAttempts = 0
    
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('SignalR: Disconnected')
      } catch (error) {
        console.warn('SignalR: Error during disconnect:', error)
      }
      this.connection = null
    }

    store.dispatch(setConnectionStatus('disconnected'))
  }

  private async waitForConnection(timeout = 5000): Promise<void> {
    const startTime = Date.now()
    
    while (!this.isConnectionReady && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Public getters and utility methods
  get connectionStatus() {
    if (this.isConnecting) return 'connecting'
    return this.isConnected ? 'connected' : 'disconnected'
  }

  get isConnectionReady(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected && this.isConnected
  }

  reset() {
    console.log('SignalR: Resetting service state')
    this.shouldConnect = true
    this.isConnected = false
    this.isConnecting = false
    this.connectionPromise = null
    this.reconnectAttempts = 0
    if (this.connection) {
      this.connection.stop().catch(() => {})
      this.connection = null
    }
  }

  enable() {
    console.log('SignalR: Enabling connection')
    this.shouldConnect = true
    this.reconnectAttempts = 0
  }

  disable() {
    console.log('SignalR: Disabling connection') 
    this.shouldConnect = false
  }

  async testConnection(): Promise<void> {
    console.log('SignalR: Testing connection...')
    
    if (!this.isConnectionReady) {
      throw new Error('SignalR connection not ready')
    }

    try {
      await this.joinUserGroup()
      console.log('SignalR: Connection test successful')
    } catch (error) {
      console.error('SignalR: Connection test failed:', error)
      throw error
    }
  }

  async testNotificationReception(): Promise<void> {
    if (!this.isConnectionReady) {
      console.warn('SignalR: Connection not ready for testing')
      return
    }

    try {
      console.log('SignalR: Testing notification reception...')
      
      const testMethods = ['TestNotification', 'SendTestNotification', 'Ping']
      
      for (const method of testMethods) {
        try {
          await this.connection!.invoke(method)
          console.log(`SignalR: Test method ${method} called successfully`)
          break
        } catch (error) {
          console.log(`SignalR: Test method ${method} failed:`, error)
        }
      }
    } catch (error) {
      console.error('SignalR: Test notification failed:', error)
    }
  }

  // Public methods for debugging
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      shouldConnect: this.shouldConnect,
      isPageVisible: this.isPageVisible,
      networkOnline: this.networkOnline,
      connectionState: this.connection?.state,
      lastConnectionAttempt: this.lastConnectionAttempt
    }
  }

  forceReconnect() {
    console.log('SignalR: Forcing reconnection...')
    this.reconnectAttempts = 0
    this.lastConnectionAttempt = 0
    this.shouldConnect = true
    return this.start()
  }
}

export const signalRService = new RobustSignalRService()