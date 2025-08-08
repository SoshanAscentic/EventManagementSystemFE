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
  type: string | number // Accept both string and number
  createdAt: string
  userId?: number
  userEmail?: string
  actionUrl?: string
  data?: Record<string, any>
}

// Get API URL from environment variables with fallback
const getApiBaseUrl = () => {
  const useLocal = import.meta.env.VITE_USE_LOCAL_API === 'true'
  const productionUrl = import.meta.env.VITE_PRODUCTION_API_URL
  const localUrl = import.meta.env.VITE_LOCAL_API_URL

  if (useLocal) {
    console.log('SignalR: Using local API:', localUrl)
    return localUrl
  } else {
    console.log('SignalR: Using production API:', productionUrl)
    return productionUrl
  }
}

class RobustSignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnected = false
  private isConnecting = false
  private connectionPromise: Promise<void> | null = null
  private shouldConnect = true
  private lastConnectionAttempt = 0
  private readonly CONNECTION_THROTTLE = 2000
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private isPageVisible = true
  private networkOnline = true
  private tokenRefreshInProgress = false

  private readonly RECONNECT_DELAYS = [
    0, 1000, 2000, 5000, 10000, 15000, 30000, 60000, 120000, 300000
  ]

  constructor() {
    this.setupBrowserEventListeners()
  }

  private setupBrowserEventListeners(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isPageVisible = !document.hidden
        console.log(`SignalR: Page visibility changed: ${this.isPageVisible ? 'visible' : 'hidden'}`)
        
        if (this.isPageVisible && !this.isConnected && this.shouldConnect) {
          console.log('SignalR: Page became visible, attempting reconnection...')
          setTimeout(() => this.start(), 1000)
        }
      })
    }

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

      this.networkOnline = navigator.onLine
    }

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

    const now = Date.now()
    const minDelay = this.CONNECTION_THROTTLE * Math.pow(2, Math.min(this.reconnectAttempts, 5))
    
    if (now - this.lastConnectionAttempt < minDelay) {
      console.log(`SignalR: Throttling connection attempt (${minDelay}ms cooldown)`)
      return
    }
    this.lastConnectionAttempt = now

    if (this.connectionPromise) {
      console.log('SignalR: Connection attempt already in progress')
      return this.connectionPromise
    }

    if (this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR: Already connected')
      this.reconnectAttempts = 0
      return Promise.resolve()
    }

    this.connectionPromise = this.connectInternal()
    
    try {
      await this.connectionPromise
      this.reconnectAttempts = 0
    } catch (error) {
      this.reconnectAttempts++
      console.warn(`SignalR: Connection attempt ${this.reconnectAttempts} failed:`, error)
      
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
      const token = await this.getValidToken()
      
      if (!token) {
        console.log('SignalR: No valid authentication token available')
        this.isConnecting = false
        store.dispatch(setConnectionStatus('disconnected'))
        return
      }

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

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${getApiBaseUrl()}/notificationHub`, {
          accessTokenFactory: async () => {
            const freshToken = await this.getValidToken()
            console.log('SignalR: Using token for request:', freshToken ? 'Present' : 'Missing')
            return freshToken || ''
          },
          withCredentials: true,
          transport: signalR.HttpTransportType.WebSockets | 
                    signalR.HttpTransportType.ServerSentEvents | 
                    signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          timeout: 30000,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
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
      
      await this.joinUserGroup()
      
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
      
      if (this.reconnectAttempts === 0) {
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

      const tokenPayload = this.parseJwtPayload(token)
      if (tokenPayload && tokenPayload.exp) {
        const expirationTime = tokenPayload.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiry = expirationTime - currentTime
        
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

      const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
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

    this.connection.onclose((error) => {
      console.log('🔴 SignalR: Connection closed', error)
      this.isConnected = false
      store.dispatch(setConnectionStatus('disconnected'))
      
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
      
      this.joinUserGroup().catch(console.warn)
      
      store.dispatch(addNotification({
        id: `signalr-auto-reconnected-${Date.now()}`,
        type: 'success',
        title: 'Reconnected',
        message: 'Real-time connection automatically restored.',
        timestamp: Date.now(),
        read: false
      }))
    })

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
      'EventCapacityReached',
      'MoreSpotsAvailable',
      'LiveEventUpdate'
    ]

    notificationEvents.forEach(eventName => {
      this.connection!.on(eventName, (notification: NotificationData) => {
        console.log(`🔔 SignalR: Received ${eventName}:`, notification)
        
        const processedNotification = {
          ...notification,
          type: notification.type || eventName
        }
        
        this.handleNotification(processedNotification, eventName)
      })
    })

    console.log(`SignalR: Registered ${notificationEvents.length} notification event handlers`)
  }

  // FIXED: Enhanced notification handling with store verification
  private handleNotification(notification: NotificationData, eventType?: string): void {
    console.log('🔔 SignalR: Processing notification:', notification, 'Event Type:', eventType)
    
    try {
      const mappedType = this.mapNotificationType(notification.type || eventType || 'info')
      console.log('🔍 Debug - Original type:', notification.type, '-> Mapped type:', mappedType)
      
      const frontendNotification = {
        id: notification.id || `signalr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: mappedType,
        title: notification.title || this.getDefaultTitle(mappedType),
        message: notification.message || 'You have a new notification',
        timestamp: notification.createdAt ? new Date(notification.createdAt).getTime() : Date.now(),
        read: false,
        data: notification.data || {},
        actionUrl: notification.actionUrl,
        persistent: true,
        showInToast: true,
      }

      console.log('🔔 SignalR: Dispatching notification to store...')
      
      // CRITICAL: Verify store exists and get current state
      if (!store) {
        console.error('❌ Redux store not found!')
        return
      }

      const stateBefore = store.getState().notifications
      console.log('📊 State BEFORE dispatch:', {
        total: stateBefore?.notifications?.length || 0,
        unread: stateBefore?.unreadCount || 0
      })

      // Dispatch the notification
      store.dispatch(addNotification(frontendNotification))
      
      // Verify it was added
      setTimeout(() => {
        const stateAfter = store.getState().notifications
        console.log('📊 State AFTER dispatch (100ms later):', {
          total: stateAfter?.notifications?.length || 0,
          unread: stateAfter?.unreadCount || 0,
          lastNotificationId: stateAfter?.notifications?.[0]?.id?.slice(-8) || 'none',
          lastNotificationType: stateAfter?.notifications?.[0]?.type || 'none'
        })
        
        // Check if our notification was actually added
        const found = stateAfter?.notifications?.find(n => n.id === frontendNotification.id)
        console.log('🔍 Verification - Notification added to store:', !!found)
        console.log('📊 Store state:', {
          total: stateAfter?.notifications?.length || 0,
          unread: stateAfter?.unreadCount || 0
        })
      }, 100)

      this.showBrowserNotification(frontendNotification)
      this.handleSpecificNotificationActions(notification, eventType)

    } catch (error) {
      console.error('❌ SignalR: Error processing notification:', error)
    }
  }

  // FIXED: Corrected type mapping based on your backend enum values
  private mapNotificationType(type: string | number): string {
    console.log('🔍 Mapping type:', typeof type, type)
    
    if (typeof type === 'number') {
      // Based on your logs, type 9 seems to be registration-related
      // Let's map this correctly based on the actual backend enum
      const enumMap: Record<number, string> = {
        0: 'info',
        1: 'success', 
        2: 'warning',
        3: 'error',
        4: 'EventCreated',
        5: 'EventUpdated',
        6: 'EventCancelled',
        7: 'RegistrationConfirmed',
        8: 'RegistrationCancelled',
        9: 'RegistrationConfirmed', // FIXED: Based on your logs, type 9 is registration confirmed
        10: 'EventCapacityReached',
        11: 'RegistrationMilestone'
      }
      
      const mapped = enumMap[type] || 'info'
      console.log('🔍 Numeric type mapped:', type, '->', mapped)
      return mapped
    }
    
    const typeString = String(type).toLowerCase()
    
    const eventTypeMap: Record<string, string> = {
      'eventcreated': 'EventCreated',
      'eventupdated': 'EventUpdated', 
      'eventcancelled': 'EventCancelled',
      'registrationconfirmed': 'RegistrationConfirmed',
      'registrationcancelled': 'RegistrationCancelled',
      'eventreminder': 'EventReminder',
      'eventcapacityreached': 'EventCapacityReached',
      'morespotesavailable': 'MoreSpotsAvailable',
      'liveeventupdate': 'LiveEventUpdate',
      'registrationmilestone': 'RegistrationMilestone',
      'spotavailable': 'SpotAvailable',
      'highdemand': 'HighDemand'
    }
    
    if (eventTypeMap[typeString]) {
      console.log('🔍 Event type matched:', typeString, '->', eventTypeMap[typeString])
      return eventTypeMap[typeString]
    }
    
    const basicTypeMap: Record<string, string> = {
      'success': 'success',
      'warning': 'warning',
      'error': 'error',
      'info': 'info'
    }
    
    const result = basicTypeMap[typeString] || 'info'
    console.log('🔍 Final mapped type:', result)
    return result
  }

  private getDefaultTitle(type?: string | number): string {
    const typeString = String(type).toLowerCase()
    
    const titleMap: Record<string, string> = {
      'eventcreated': 'New Event Available',
      'eventupdated': 'Event Updated',
      'eventcancelled': 'Event Cancelled',
      'registrationconfirmed': 'Registration Confirmed',
      'registrationcancelled': 'Registration Cancelled', 
      'eventreminder': 'Event Reminder',
      'eventcapacityreached': 'Event Full',
      'morespotesavailable': 'More Spots Available',
      'liveeventupdate': 'Live Event Update',
      'registrationmilestone': 'Registration Milestone',
      'spotavailable': 'Spot Available',
      'highdemand': 'High Demand Event',
      'success': 'Success',
      'warning': 'Warning',
      'error': 'Error',
      'info': 'Information'
    }
    
    return titleMap[typeString] || 'New Notification'
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
    const type = String(notification.type || eventType).toLowerCase()
    const { data } = notification

    console.log(`SignalR: Handling specific actions for ${type}`, data)

    switch (type) {
      case 'eventcreated':
        this.invalidateEventsCache()
        break
      
      case 'eventupdated':
      case 'morespotesavailable':
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        this.invalidateEventsCache()
        break
      
      case 'eventcancelled':
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        this.invalidateEventsCache()
        this.invalidateRegistrationsCache()
        break
      
      case 'registrationconfirmed':
        this.invalidateRegistrationsCache()
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
          this.invalidateEventRegistrationsCache(data.eventId)
        }
        break
      
      case 'registrationcancelled':
        this.invalidateRegistrationsCache()
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
          this.invalidateEventRegistrationsCache(data.eventId)
        }
        break
      
      case 'eventreminder':
        break
        
      case 'eventcapacityreached':
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        break

      case 'liveeventupdate':
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        break
    }
  }

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