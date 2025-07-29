import * as signalR from '@microsoft/signalr'
import { store } from '@/app/store/store'
import { addNotification } from '@/features/notifications/notificationSlice'

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnected = false
  private hasTriedConnection = false
  
  async start(): Promise<void> {
    // Skip if already tried and failed, or already connected
    if (this.hasTriedConnection && !this.isConnected) {
      console.log('SignalR: Skipping connection attempt (previous failure)')
      return
    }

    if (this.isConnected) {
      console.log('SignalR: Already connected')
      return
    }

    this.hasTriedConnection = true

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:7026/hubs/notifications', {
          withCredentials: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning) // Reduce log spam
        .build()

      this.setupEventHandlers()

      await this.connection.start()
      this.isConnected = true
      console.log('SignalR: Connected successfully')
    } catch (error) {
      console.warn('SignalR: Connection failed - running without real-time features')
      this.isConnected = false
      this.connection = null
      // Don't throw error - app should work without SignalR
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('SignalR: Disconnected')
      } catch (error) {
        console.warn('SignalR: Error during disconnect:', error)
      }
      this.connection = null
      this.isConnected = false
    }
  }

  async joinAdminGroup(): Promise<void> {
    if (!this.isConnected || !this.connection) {
      console.log('SignalR: Cannot join admin group - not connected')
      return
    }

    try {
      await this.connection.invoke('JoinAdminGroup')
      console.log('SignalR: Joined admin group')
    } catch (error) {
      console.warn('SignalR: Failed to join admin group:', error)
    }
  }

  async leaveAdminGroup(): Promise<void> {
    if (!this.isConnected || !this.connection) {
      return
    }

    try {
      await this.connection.invoke('LeaveAdminGroup')
      console.log('SignalR: Left admin group')
    } catch (error) {
      console.warn('SignalR: Failed to leave admin group:', error)
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return

    // Real-time notifications
    this.connection.on('ReceiveNotification', (notification) => {
      try {
        store.dispatch(addNotification(notification))
      } catch (error) {
        console.warn('SignalR: Error handling notification:', error)
      }
    })

    // Event updates
    this.connection.on('EventUpdated', (eventData) => {
      console.log('SignalR: Event updated:', eventData)
      // Invalidate relevant caches
    })

    // Registration updates
    this.connection.on('RegistrationUpdate', (data) => {
      console.log('SignalR: Registration update:', data)
    })

    // Capacity alerts
    this.connection.on('CapacityAlert', (data) => {
      try {
        store.dispatch(addNotification({
          type: 'warning',
          title: 'Capacity Alert',
          message: `Event "${data.eventTitle}" is nearing capacity`,
          data: data
        }))
      } catch (error) {
        console.warn('SignalR: Error handling capacity alert:', error)
      }
    })

    // Handle connection state changes
    this.connection.onclose(() => {
      this.isConnected = false
      console.log('SignalR: Connection closed')
    })

    this.connection.onreconnected(() => {
      this.isConnected = true
      console.log('SignalR: Reconnected')
    })
  }

  async joinEventGroup(eventId: number): Promise<void> {
    if (!this.isConnected || !this.connection) {
      return
    }

    try {
      await this.connection.invoke('JoinEventGroup', eventId)
    } catch (error) {
      console.warn('SignalR: Failed to join event group:', error)
    }
  }

  async leaveEventGroup(eventId: number): Promise<void> {
    if (!this.isConnected || !this.connection) {
      return
    }

    try {
      await this.connection.invoke('LeaveEventGroup', eventId)
    } catch (error) {
      console.warn('SignalR: Failed to leave event group:', error)
    }
  }

  get connectionStatus() {
    return this.isConnected ? 'connected' : 'disconnected'
  }
}

export const signalRService = new SignalRService() 