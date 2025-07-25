import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/router/AppRouter'
import { Toaster } from 'sonner'
import './App.css'

function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </AppProviders>
  )
}

export default App