import { Provider } from 'react-redux'
import { store } from '@/app/store/store'

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}