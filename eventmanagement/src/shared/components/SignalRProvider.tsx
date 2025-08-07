import { useSignalR } from '../hooks/useSignalR'

interface SignalRProviderProps {
  children: React.ReactNode
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  // This will initialize SignalR connection when user is authenticated
  useSignalR()

  return <>{children}</>
}