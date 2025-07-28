import * as signalR from '@microsoft/signalr'
import { store } from '@/app/store/store'
import { addNotification } from '@/features/notifications/notificationSlice'

class SignalRService {
  joinAdminGroup() {
    throw new Error('Method not implemented.')
  }
  private connection: signalR.HubConnection | null = null
  
  async start(): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build()

    this.setupEventHandlers()

    try {
      await this.connection.start()
      console.log('SignalR Connected')
    } catch (error) {
      console.error('SignalR Connection Error:', error)
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return

    // Real-time notifications
    this.connection.on('ReceiveNotification', (notification) => {
      store.dispatch(addNotification(notification))
    })

    // Event updates
    this.connection.on('EventUpdated', (eventData) => {
      console.log('Event updated:', eventData)
      // Invalidate relevant caches
    })

    // Registration updates
    this.connection.on('RegistrationUpdate', (data) => {
      console.log('Registration update:', data)
    })

    // Capacity alerts
    this.connection.on('CapacityAlert', (data) => {
      store.dispatch(addNotification({
        type: 'warning',
        title: 'Capacity Alert',
        message: `Event "${data.eventTitle}" is nearing capacity`,
        data: data
      }))
    })
  }

  async joinEventGroup(eventId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinEventGroup', eventId)
    }
  }

  async leaveEventGroup(eventId: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveEventGroup', eventId)
    }
  }
}

export const signalRService = new SignalRService()