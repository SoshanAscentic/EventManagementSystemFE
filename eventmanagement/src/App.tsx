import { AppRouter } from './router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'
import { Toaster } from './shared/components/Toaster'
import { useSignalR } from './shared/hooks/useSignalR'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

function AppContent() {
  useSignalR() // Initialize SignalR connection

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  )
}

function App() {
  return (
      <AppProviders>
        <AppContent />
      </AppProviders>
  )
}

export default App