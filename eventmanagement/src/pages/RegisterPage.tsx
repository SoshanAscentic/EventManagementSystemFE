import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/molecules'
import { Input, Icon } from '@/components/atoms'
import { useRegisterMutation } from '@/features/auth/api/authApi'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [register, { isLoading, error }] = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('Attempting registration for:', data.email)
      
      const result = await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }).unwrap()
      
      if (result.success) {
        console.log('Registration successful:', result.data)
        navigate('/auth/login', { 
          state: { 
            message: 'Registration successful! Please sign in with your new account.',
            email: data.email 
          }
        })
      }
    } catch (error: any) {
      console.error('Registration failed:', error)
      
      // Handle specific error cases
      if (error.status === 400) {
        if (error.data?.message?.includes('email')) {
          setError('email', { message: 'This email is already registered' })
        } else {
          setError('email', { message: error.data?.message || 'Registration failed' })
        }
      } else {
        setError('email', { message: 'Registration failed. Please try again.' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl rotate-12 opacity-40 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl -rotate-6 opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative w-full max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-6 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Icon name="UserPlus" className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Join EventHub</h1>
              <p className="text-white/90 text-sm">Create your account to start discovering amazing events</p>
            </div>
          </div>
          
          {/* Form Container */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* General Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">
                    {(error as any)?.data?.message || 'Registration failed. Please try again.'}
                  </p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  error={errors.firstName?.message}
                  required
                >
                  <Input
                    placeholder="John"
                    {...formRegister('firstName')}
                    autoComplete="given-name"
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  error={errors.lastName?.message}
                  required
                >
                  <Input
                    placeholder="Doe"
                    {...formRegister('lastName')}
                    autoComplete="family-name"
                  />
                </FormField>
              </div>

              {/* Email Field */}
              <FormField
                label="Email"
                error={errors.email?.message}
                required
              >
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  {...formRegister('email')}
                  autoComplete="email"
                />
              </FormField>

              {/* Password Field */}
              <FormField
                label="Password"
                error={errors.password?.message}
                required
              >
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...formRegister('password')}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <Icon
                      name={showPassword ? 'EyeOff' : 'Eye'}
                      className="h-4 w-4 text-gray-400"
                    />
                  </Button>
                </div>
              </FormField>

              {/* Confirm Password Field */}
              <FormField
                label="Confirm Password"
                error={errors.confirmPassword?.message}
                required
              >
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...formRegister('confirmPassword')}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    <Icon
                      name={showConfirmPassword ? 'EyeOff' : 'Eye'}
                      className="h-4 w-4 text-gray-400"
                    />
                  </Button>
                </div>
              </FormField>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-lg font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/auth/login"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Terms */}
              <div className="text-center text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-gray-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline hover:text-gray-700">
                  Privacy Policy
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
          <p className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/30">
            🎉 Join thousands of event enthusiasts!
          </p>
        </div>
      </div>
    </div>
  )
}