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
import { useLoginMutation } from '../api/authApi'
import { useAppDispatch } from '@/app/hooks'
import { setAuth } from '@/app/slices/authSlice'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

export const LoginForm = ({ onSuccess, className }: LoginFormProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap()
      if (result.success) {
        dispatch(setAuth({
          user: result.data.user,
          roles: result.data.roles,
        }))
        onSuccess?.()
        navigate('/')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      // Error handling will be done by global error handler
    }
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email"
            error={errors.email?.message}
            required
          >
            <Input
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              autoComplete="email"
            />
          </FormField>

          <FormField
            label="Password"
            error={errors.password?.message}
            required
          >
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                autoComplete="current-password"
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
          </FormField>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked: any) => setValue('rememberMe', !!checked)}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Icon name="LogIn" className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
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

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/auth/forgot-password"
              className="text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
            <Link
              to="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Create account
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}