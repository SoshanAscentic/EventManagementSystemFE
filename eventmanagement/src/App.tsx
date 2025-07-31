import { useEffect } from 'react'
import { AppRouter } from './router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
import { Toaster } from './shared/components/Toaster'
import { useAuth } from './shared/hooks/useAuth'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { useSignalRConnection } from './shared/hooks/useSignalRConnection'

function AppContent() {
  const { isLoading } = useAuth()
  
  // ✅ Move SignalR initialization here, inside the Redux Provider context
  useSignalRConnection()

  // Show loading screen during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading EventHub...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  )
}

function App() {
  // ✅ Remove useSignalRConnection from here - it's now in AppContent

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App