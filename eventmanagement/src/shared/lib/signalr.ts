import * as signalR from '@microsoft/signalr'
import { store } from '@/app/store/store'
import { addNotification, setConnectionStatus } from '@/shared/store/slices/notificationSlice'
import { getTokenFromCookie } from '@/features/auth/api/authApi'
import { eventsApi } from '@/features/events/api/eventsApi'
import { registrationsApi } from '@/features/registrations/api/registrationsApi'

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnected = false
  private isConnecting = false
  private hasTriedConnection = false
  private connectionPromise: Promise<void> | null = null
  private shouldConnect = true // Add this flag
  
  private lastConnectionAttempt = 0
  private readonly CONNECTION_THROTTLE = 5000 // 5 seconds between attempts

  async start(): Promise<void> {
    // ✅ Throttle connection attempts
    const now = Date.now()
    if (now - this.lastConnectionAttempt < this.CONNECTION_THROTTLE) {
      console.log('SignalR: Throttling connection attempt')
      return
    }
    this.lastConnectionAttempt = now

    // Check if we should connect
    if (!this.shouldConnect) {
      console.log('SignalR: Connection disabled')
      return
    }

    // Return existing connection attempt if in progress
    if (this.connectionPromise) {
      console.log('SignalR: Returning existing connection promise')
      return this.connectionPromise
    }

    // Skip if already connected
    if (this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR: Already connected')
      return Promise.resolve()
    }

    // Create and store the connection promise
    this.connectionPromise = this.connectInternal()
    
    try {
      await this.connectionPromise
    } catch (error) {
      console.warn('SignalR: Connection attempt failed:', error)
    } finally {
      this.connectionPromise = null
    }
  }

  private async connectInternal(): Promise<void> {
    // Check if we should still connect
    if (!this.shouldConnect) {
      console.log('SignalR: Connection cancelled - shouldConnect is false')
      return
    }

    // Double-check to prevent race conditions
    if (this.isConnecting) {
      console.log('SignalR: Connection attempt already in progress, waiting...')
      // Wait for current attempt to complete
      let attempts = 0
      while (this.isConnecting && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      return
    }

    this.isConnecting = true
    console.log('SignalR: Starting connection...')

    try {
      // Get JWT token for authentication
      const token = getTokenFromCookie('accessToken')
      
      console.log('SignalR: Token available:', !!token)
      
      if (!token) {
        console.log('SignalR: No authentication token available')
        this.isConnecting = false
        return
      }

      // Check again if we should connect
      if (!this.shouldConnect) {
        console.log('SignalR: Connection cancelled during setup')
        this.isConnecting = false
        return
      }

      // Stop existing connection if any
      if (this.connection) {
        console.log('SignalR: Stopping existing connection')
        try {
          await this.connection.stop()
        } catch (stopError) {
          console.warn('SignalR: Error stopping existing connection:', stopError)
        }
        this.connection = null
      }

      // Check one more time before creating connection
      if (!this.shouldConnect) {
        console.log('SignalR: Connection cancelled before creation')
        this.isConnecting = false
        return
      }

      // Create new connection
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL || 'https://localhost:7026'}/notificationHub`, {
          accessTokenFactory: () => {
            const token = getTokenFromCookie('accessToken')
            console.log('SignalR: Using token:', token ? 'Present' : 'Missing')
            return token || ''
          },
          withCredentials: true,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information) // Reduce logging
        .build()
  
      this.setupEventHandlers()

      // Final check before connecting
      if (!this.shouldConnect) {
        console.log('SignalR: Connection cancelled before start')
        this.isConnecting = false
        if (this.connection) {
          this.connection = null
        }
        return
      }

      console.log('SignalR: Attempting to start connection...')
      await this.connection.start()
      
      // Check if we're still supposed to be connected after the async operation
      if (!this.shouldConnect) {
        console.log('SignalR: Connection established but no longer needed, stopping')
        await this.connection.stop()
        this.connection = null
        this.isConnecting = false
        return
      }

      console.log('SignalR: Connected successfully')
      this.isConnecting = false
      this.isConnected = true
      
      // Update Redux state
      store.dispatch(setConnectionStatus('connected'))
      
      // Join user-specific group if needed
      await this.joinUserGroup()
      
    } catch (error) {
      console.error('SignalR: Connection failed - running without real-time features', error)
      this.isConnecting = false
      this.isConnected = false
      store.dispatch(setConnectionStatus('disconnected'))
      throw error
    }
  }

  async joinUserGroup(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('SignalR: Cannot join user group - not connected')
      return
    }

    try {
      const token = getTokenFromCookie('accessToken')
      if (!token) {
        console.warn('SignalR: No token available for joining user group')
        return
      }

      // ✅ Try multiple possible method names
      const possibleMethods = ['JoinUserGroup', 'JoinGroup', 'Subscribe', 'SubscribeToNotifications']
      
      for (const method of possibleMethods) {
        try {
          console.log(`SignalR: Attempting to call ${method}`)
          await this.connection.invoke(method)
          console.log(`SignalR: Successfully joined user group via ${method}`)
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

  async stop(): Promise<void> {
    console.log('SignalR: Stopping service...')
    
    // Signal that we don't want to connect anymore
    this.shouldConnect = false
    
    // Clear any pending connection attempts
    this.connectionPromise = null
    this.isConnecting = false
    this.isConnected = false
    
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('SignalR: Disconnected')
      } catch (error) {
        console.warn('SignalR: Error during disconnect:', error)
      }
      this.connection = null
    }

    // Update Redux state
    store.dispatch(setConnectionStatus('disconnected'))
  }

  async joinEventGroup(eventId: number): Promise<void> {
    // Wait for connection to be ready
    await this.waitForConnection()
    
    if (!this.isConnectionReady) {
      console.log('SignalR: Cannot join event group - not connected')
      return
    }

    try {
      await this.connection!.invoke('JoinEventGroup', eventId)
      console.log(`SignalR: Joined event group ${eventId}`)
    } catch (error) {
      console.warn('SignalR: Failed to join event group:', error)
    }
  }

  async leaveEventGroup(eventId: number): Promise<void> {
    if (!this.isConnectionReady) {
      return
    }

    try {
      await this.connection!.invoke('LeaveEventGroup', eventId)
      console.log(`SignalR: Left event group ${eventId}`)
    } catch (error) {
      console.warn('SignalR: Failed to leave event group:', error)
    }
  }

  private async waitForConnection(timeout = 5000): Promise<void> {
    const startTime = Date.now()
    
    while (!this.isConnectionReady && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return

    console.log('SignalR: Setting up event handlers')

    // Handle connection state changes
    this.connection.onclose((error) => {
      console.log('SignalR: Connection closed', error)
      this.isConnected = false
      store.dispatch(setConnectionStatus('disconnected'))
    })

    this.connection.onreconnecting((error) => {
      console.log('SignalR: Reconnecting...', error)
      store.dispatch(setConnectionStatus('connecting'))
    })

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR: Reconnected', connectionId)
      this.isConnected = true
      store.dispatch(setConnectionStatus('connected'))
      // Rejoin user group after reconnection
      this.joinUserGroup().catch(console.warn)
    })

    // ✅ Listen for ALL possible notification event names
    const notificationEventNames = [
      'ReceiveNotification',
      'NotificationSent', 
      'EventNotification',
      'UserNotification',
      'BroadcastNotification',
      'AdminNotification'
    ]

    notificationEventNames.forEach(eventName => {
      this.connection!.on(eventName, (notification) => {
        console.log(`SignalR: Received ${eventName}:`, notification)
        this.handleNotification(notification)
      })
    })

    // ✅ Add catch-all listener to see what events are actually being sent
    this.connection.on('*', (eventName: string, ...args: any[]) => {
      console.log('SignalR: Received unknown event:', eventName, args)
    })

    // ✅ Test connection with ping/pong
    this.connection.on('Ping', () => {
      console.log('SignalR: Received ping')
    })
  }

  private handleNotification(notification: any): void {
    console.log('🔔 SignalR: Processing notification:', notification)

    try {
      // Convert backend notification to frontend notification format
      const frontendNotification = {
        id: notification.id || Date.now().toString(),
        type: this.mapNotificationType(notification.type || notification.notificationType || 'info'),
        title: notification.title || notification.Title || 'New Notification',
        message: notification.message || notification.Message || notification.body || 'You have a new notification',
        timestamp: notification.createdAt ? new Date(notification.createdAt).getTime() : Date.now(),
        read: notification.isRead || false,
        data: notification.data || notification.Data || {},
        actionUrl: notification.actionUrl || notification.ActionUrl
      }

      console.log('🔔 SignalR: Dispatching frontend notification:', frontendNotification)

      // Add to notification store
      store.dispatch(addNotification(frontendNotification))

      // Show browser notification if permission granted
      this.showBrowserNotification(frontendNotification)

      // Handle specific notification types
      this.handleSpecificNotification(notification)
    } catch (error) {
      console.error('SignalR: Error processing notification:', error)
    }
  }

  private showBrowserNotification(notification: any): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      })
    }
  }

  private handleSpecificNotification(notification: any): void {
    const { type, data } = notification

    switch (type) {
      case 'EventCreated':
        // Invalidate events cache to show new event
        this.invalidateEventsCache()
        break
      
      case 'EventUpdated':
        // Invalidate specific event cache
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        break
      
      case 'EventCancelled':
        // Invalidate events and registrations cache
        this.invalidateEventsCache()
        this.invalidateRegistrationsCache()
        break
      
      case 'RegistrationConfirmed':
      case 'RegistrationCancelled':
        // Invalidate registrations cache
        this.invalidateRegistrationsCache()
        if (data?.eventId) {
          this.invalidateEventCache(data.eventId)
        }
        break
      
      case 'EventReminder':
        // Show special reminder notification
        console.log('Event reminder:', data)
        break
      
      case 'EventCapacityReached':
        // Admin notification - show capacity alert
        console.log('Event capacity reached:', data)
        break
    }
  }

  private invalidateEventsCache(): void {
    console.log('SignalR: Invalidating events cache')
    store.dispatch(eventsApi.util.invalidateTags([{ type: 'Event', id: 'LIST' }]))
  }

  private invalidateEventCache(eventId: number): void {
    console.log(`SignalR: Invalidating event ${eventId} cache`)
    store.dispatch(eventsApi.util.invalidateTags([
      { type: 'Event', id: eventId },
      { type: 'Event', id: 'LIST' }
    ]))
  }

  private invalidateRegistrationsCache(): void {
    console.log('SignalR: Invalidating registrations cache')
    store.dispatch(registrationsApi.util.invalidateTags([{ type: 'Registration', id: 'LIST' }]))
  }

  get connectionStatus() {
    if (this.isConnecting) return 'connecting'
    return this.isConnected ? 'connected' : 'disconnected'
  }

  get isConnectionReady(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected && this.isConnected
  }

  // Reset connection state (useful for debugging or forced reconnection)
  reset() {
    console.log('SignalR: Resetting service state')
    this.shouldConnect = true // Reset the connection flag
    this.hasTriedConnection = false
    this.isConnected = false
    this.isConnecting = false
    this.connectionPromise = null
    if (this.connection) {
      this.connection.stop().catch(() => {})
      this.connection = null
    }
  }

  // Enable connection attempts
  enable() {
    console.log('SignalR: Enabling connection')
    this.shouldConnect = true
  }

  // Disable connection attempts
  disable() {
    console.log('SignalR: Disabling connection')
    this.shouldConnect = false
  }

  // ✅ Replace with a simple connection status check
  async testConnection(): Promise<void> {
    console.log('SignalR: Testing connection...')
    
    if (!this.isConnectionReady) {
      throw new Error('SignalR connection not ready')
    }

    try {
      // ✅ Test with a method that actually exists
      await this.joinUserGroup()
      console.log('SignalR: Connection test successful - user group joined')
    } catch (error) {
      console.error('SignalR: Connection test failed:', error)
      throw error
    }
  }

  // ✅ Add method to test notification reception
  async testNotificationReception(): Promise<void> {
    if (!this.isConnectionReady) {
      console.warn('SignalR: Connection not ready for testing')
      return
    }

    try {
      console.log('SignalR: Testing notification reception...')
      
      // Try to invoke a test method on the server
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
}

export const signalRService = new SignalRService()