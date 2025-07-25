import { useLocation } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icon } from '@/components/atoms'

export const LoginPage = () => {
  const location = useLocation()
  const message = location.state?.message

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <Icon name="CheckCircle" className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <LoginForm />
    </div>
  )
}