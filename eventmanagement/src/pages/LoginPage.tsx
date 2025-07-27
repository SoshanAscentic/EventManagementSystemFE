import { useLocation } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icon } from '@/components/atoms'

export const LoginPage = () => {
  const location = useLocation()
  const message = location.state?.message

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl rotate-12 opacity-40 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl -rotate-6 opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative w-full max-w-md mx-auto px-4 animate-fade-in">
        {/* Success Message */}
        {message && (
          <div className="mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <Alert className="bg-white/80 backdrop-blur-sm border border-green-200 shadow-lg">
              <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Enhanced Login Form Container */}
        <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-center relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Icon name="Lock" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-white/90 text-sm">Sign in to your EventHub account</p>
              </div>
            </div>
            
            {/* Form Container */}
            <div className="p-8">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <p className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/30">
            🔒 Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )
}