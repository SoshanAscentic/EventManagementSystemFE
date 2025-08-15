import { Provider } from 'react-redux'
import { store } from '@/app/store/store'
import { SignalRProvider } from '@/shared/components/SignalRProvider'

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <Provider store={store}>
      <SignalRProvider>
        {children}
      </SignalRProvider>
    </Provider>
  )
}