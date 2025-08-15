import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/molecules'
import { Input, Icon } from '@/components/atoms'
import { useUpdateProfileMutation } from '../api/usersApi'
import { UserDto } from '@/shared/types/domain'

// Validation schema matching backend requirements
const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true // Optional field
      // Phone validation: supports various formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      return phoneRegex.test(val.replace(/[\s\-\(\)]/g, ''))
    }, {
      message: 'Please enter a valid phone number'
    }),
})

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

interface ProfileEditFormProps {
  user: UserDto
  onSuccess: () => void
  onCancel: () => void
}

export const ProfileEditForm = ({ user, onSuccess, onCancel }: ProfileEditFormProps) => {
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setError,
    reset,
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phoneNumber || '',
    },
  })

  const watchedValues = watch()

  const handleFormSubmit = async (data: ProfileUpdateData) => {
    try {
      // Clean and format data for API
      const updateData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || undefined, // Send undefined for empty phone
      }

      await updateProfile(updateData).unwrap()
      onSuccess()
    } catch (error: any) {
      console.error('Profile update failed:', error)
      
      // Handle specific error cases
      if (error.status === 400) {
        if (error.data?.errors) {
          // Handle validation errors from backend
          Object.entries(error.data.errors).forEach(([field, messages]) => {
            const fieldName = field.toLowerCase() as keyof ProfileUpdateData
            if (Array.isArray(messages) && messages.length > 0) {
              setError(fieldName, { message: messages[0] })
            }
          })
        } else if (error.data?.message) {
          setError('firstName', { message: error.data.message })
        }
      } else if (error.status === 401) {
        setError('firstName', { message: 'Your session has expired. Please log in again.' })
      } else {
        setError('firstName', { message: 'Failed to update profile. Please try again.' })
      }
    }
  }

  const handleCancel = () => {
    reset() // Reset form to original values
    onCancel()
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Icon name="Edit" className="mr-3 h-5 w-5 text-blue-600" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* General Error Display */}
          {error && !errors.firstName && !errors.lastName && !errors.phone && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <Icon name="AlertCircle" className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Update Failed</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {(error as any)?.data?.message || 'Unable to update profile. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="First Name"
              error={errors.firstName?.message}
              required
            >
              <Input
                {...register('firstName')}
                placeholder="Enter your first name"
                maxLength={50}
                className="bg-white"
              />
              <div className="text-xs text-gray-500 mt-1">
                {watchedValues.firstName?.length || 0}/50 characters
              </div>
            </FormField>

            <FormField
              label="Last Name"
              error={errors.lastName?.message}
              required
            >
              <Input
                {...register('lastName')}
                placeholder="Enter your last name"
                maxLength={50}
                className="bg-white"
              />
              <div className="text-xs text-gray-500 mt-1">
                {watchedValues.lastName?.length || 0}/50 characters
              </div>
            </FormField>
          </div>

          <FormField
            label="Phone Number"
            error={errors.phone?.message}
            description="Optional - Enter your phone number for account security"
          >
            <Input
              type="tel"
              {...register('phone')}
              placeholder="e.g., +1 (555) 123-4567"
              className="bg-white"
            />
            <div className="text-xs text-gray-500 mt-1">
              International format recommended (e.g., +1234567890)
            </div>
          </FormField>

          {/* Profile Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              <Icon name="Eye" className="mr-2 h-4 w-4" />
              Preview
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="text-blue-700 font-medium w-20">Name:</span>
                <span className="text-blue-800">
                  {watchedValues.firstName || 'First'} {watchedValues.lastName || 'Last'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-700 font-medium w-20">Email:</span>
                <span className="text-blue-800">{user.email}</span>
                <span title="Email cannot be changed">
                  <Icon name="Lock" className="ml-2 h-3 w-3 text-blue-500" />
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-700 font-medium w-20">Phone:</span>
                <span className="text-blue-800">
                  {watchedValues.phone?.trim() || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Icon name="X" className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="flex items-center">
              <Icon name="Info" className="mr-2 h-3 w-3" />
              <strong>Note:</strong> Your email address cannot be changed for security reasons. 
              Contact support if you need to update your email.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}