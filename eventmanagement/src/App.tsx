import { AppRouter } from './router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
import { Toaster } from './shared/components/Toaster'
import { useAuth } from './shared/hooks/useAuth'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

function AppContent() {
  const { isLoading } = useAuth()
  
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
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App