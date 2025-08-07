import React from 'react'
import { useSignalR } from '@/shared/hooks/useSignalR'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { addNotification } from '@/features/notifications/notificationSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const NotificationTester: React.FC = () => {
  const { connectionStatus, isConnected, testConnection, testNotification } = useSignalR()
  const { unreadCount } = useAppSelector(state => state.notifications)
  const dispatch = useAppDispatch()

  const handleTestLocalNotification = () => {
    dispatch(addNotification({
      id: `local-test-${Date.now()}`,
      type: 'EventCreated',
      title: '🎉 Local Test Notification',
      message: 'This is a local notification created by the test button.',
      timestamp: Date.now(),
      read: false,
      data: { source: 'local-test' }
    }))
  }

  const handleTestSignalRConnection = async () => {
    try {
      await testConnection()
      dispatch(addNotification({
        id: `connection-test-${Date.now()}`,
        type: 'success',
        title: '✅ Connection Test Successful',
        message: 'SignalR connection is working properly!',
        timestamp: Date.now(),
        read: false
      }))
    } catch (error) {
      dispatch(addNotification({
        id: `connection-test-error-${Date.now()}`,
        type: 'error',
        title: '❌ Connection Test Failed',
        message: `SignalR connection test failed: ${error}`,
        timestamp: Date.now(),
        read: false
      }))
    }
  }

  const handleTestSignalRNotification = async () => {
    try {
      await testNotification()
      console.log('SignalR test notification requested - check for incoming notification')
    } catch (error) {
      dispatch(addNotification({
        id: `signalr-test-error-${Date.now()}`,
        type: 'error',
        title: '❌ SignalR Test Failed',
        message: `Failed to send test notification: ${error}`,
        timestamp: Date.now(),
        read: false
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔔 Notification Tester</span>
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${getStatusColor(connectionStatus)}`}
              title={`SignalR: ${connectionStatus}`}
            />
            <Badge variant="outline">
              {unreadCount} unread
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600">
          <strong>Status:</strong> {connectionStatus.toUpperCase()}
          <br />
          <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
          <br />
          <strong>Unread Count:</strong> {unreadCount}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleTestLocalNotification}
            variant="outline" 
            className="w-full"
          >
            Test Local Notification
          </Button>

          <Button 
            onClick={handleTestSignalRConnection}
            variant="outline" 
            className="w-full"
            disabled={!isConnected}
          >
            Test SignalR Connection
          </Button>

          <Button 
            onClick={handleTestSignalRNotification}
            variant="outline" 
            className="w-full"
            disabled={!isConnected}
          >
            Test SignalR Notification
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          💡 Use this component in development to test the notification system.
          Remove it in production.
        </div>
      </CardContent>
    </Card>
  )
}
