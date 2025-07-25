// src/features/auth/components/RegisterForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/molecules'
import { Input, Icon } from '@/components/atoms'
import { useRegisterMutation } from '../api/authApi'
import { cn } from '@/lib/utils'
import { Progress } from '@radix-ui/react-progress'

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
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  marketingEmails: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export interface RegisterFormProps {
  onSuccess?: () => void
  className?: string
}

export const RegisterForm = ({ onSuccess, className }: RegisterFormProps) => {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false,
      marketingEmails: false,
    },
  })

  const password = watch('password')
  const acceptTerms = watch('acceptTerms')
  const marketingEmails = watch('marketingEmails')

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password?.length >= 8 || false,
      lowercase: /[a-z]/.test(password || ''),
      uppercase: /[A-Z]/.test(password || ''),
      numbers: /[0-9]/.test(password || ''),
      special: /[^A-Za-z0-9]/.test(password || ''),
    }
    
    if (!password) return { strength: 0, label: '', color: 'bg-gray-200', checks }
    
    let strength = 0
    strength = Object.values(checks).filter(Boolean).length
    
    const strengthMap = {
      0: { label: '', color: 'bg-gray-200' },
      1: { label: 'Very Weak', color: 'bg-red-500' },
      2: { label: 'Weak', color: 'bg-orange-500' },
      3: { label: 'Fair', color: 'bg-yellow-500' },
      4: { label: 'Strong', color: 'bg-blue-500' },
      5: { label: 'Very Strong', color: 'bg-green-500' },
    }

    return {
      strength,
      ...strengthMap[strength as keyof typeof strengthMap],
      checks,
    }
  }

  const passwordStrength = getPasswordStrength(password || '')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }).unwrap()
      
      if (result.success) {
        onSuccess?.()
        navigate('/auth/login', { 
          state: { 
            message: 'Registration successful! Please check your email to verify your account, then sign in.',
            email: data.email 
          }
        })
      }
    } catch (error: any) {
      console.error('Registration failed:', error)
      // Error handling will be done by global error handler
    }
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create account</CardTitle>
        <CardDescription className="text-center">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="space-y-2">
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
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(passwordStrength.strength / 5) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-gray-600 min-w-20">
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="text-xs space-y-1">
                    <div className={cn(
                      'flex items-center gap-1',
                      passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'
                    )}>
                      <Icon 
                        name={passwordStrength.checks.length ? 'Check' : 'X'} 
                        className="h-3 w-3" 
                      />
                      At least 8 characters
                    </div>
                    <div className={cn(
                      'flex items-center gap-1',
                      passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'
                    )}>
                      <Icon 
                        name={passwordStrength.checks.lowercase ? 'Check' : 'X'} 
                        className="h-3 w-3" 
                      />
                      One lowercase letter
                    </div>
                    <div className={cn(
                      'flex items-center gap-1',
                      passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'
                    )}>
                      <Icon 
                        name={passwordStrength.checks.uppercase ? 'Check' : 'X'} 
                        className="h-3 w-3" 
                      />
                      One uppercase letter
                    </div>
                    <div className={cn(
                      'flex items-center gap-1',
                      passwordStrength.checks.numbers ? 'text-green-600' : 'text-gray-500'
                    )}>
                      <Icon 
                        name={passwordStrength.checks.numbers ? 'Check' : 'X'} 
                        className="h-3 w-3" 
                      />
                      One number
                    </div>
                  </div>
                </div>
              )}
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
                <span className="sr-only">
                  {showConfirmPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </FormField>

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setValue('acceptTerms', !!checked)}
                className="mt-0.5"
              />
              <label htmlFor="acceptTerms" className="text-sm leading-5 cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketingEmails"
                checked={marketingEmails}
                onCheckedChange={(checked) => setValue('marketingEmails', !!checked)}
                className="mt-0.5"
              />
              <label htmlFor="marketingEmails" className="text-sm leading-5 cursor-pointer text-gray-600">
                I'd like to receive marketing emails about new events and features
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !isValid}
            size="lg"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                Create account
              </>
            )}
          </Button>

          {/* Social Registration */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or register with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" disabled={isLoading}>
              <Icon name="Github" className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" type="button" disabled={isLoading}>
              <Icon name="Mail" className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}