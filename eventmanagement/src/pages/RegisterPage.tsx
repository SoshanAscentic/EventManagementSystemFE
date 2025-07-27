import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { Icon } from '@/components/atoms'

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center relative overflow-hidden py-12">
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
        {/* Enhanced Register Form Container */}
        <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-center relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Icon name="UserPlus" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Join EventHub</h1>
                <p className="text-white/90 text-sm">Create your account and start discovering events</p>
              </div>
            </div>
            
            {/* Form Container */}
            <div className="p-8">
              <RegisterForm />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 text-center">Why join EventHub?</h3>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div className="text-center">
                <Icon name="Calendar" className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <span>Discover Events</span>
              </div>
              <div className="text-center">
                <Icon name="Users" className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <span>Connect</span>
              </div>
              <div className="text-center">
                <Icon name="Star" className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                <span>Get Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}