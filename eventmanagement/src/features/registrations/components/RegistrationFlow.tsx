import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/molecules'
import { Input, Icon } from '@/components/atoms'
import { EventDto } from '@/shared/types/domain'

interface RegistrationFlowProps {
  event: EventDto
  onComplete: (data: any) => Promise<void>
  loading?: boolean
}

export const RegistrationFlow = ({ event, onComplete, loading }: RegistrationFlowProps) => {
  const [step, setStep] = useState(1)
  const [registrationData, setRegistrationData] = useState({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()

  const handleStepSubmit = (data: any) => {
    setRegistrationData(prev => ({ ...prev, ...data }))
    
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete({ ...registrationData, ...data, eventId: event.id })
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.firstName?.message} required>
                <Input {...register('firstName', { required: true })} />
              </FormField>
              <FormField label="Last Name" error={errors.lastName?.message} required>
                <Input {...register('lastName', { required: true })} />
              </FormField>
            </div>
            <FormField label="Email" error={errors.email?.message} required>
              <Input type="email" {...register('email', { required: true })} />
            </FormField>
            <FormField label="Phone Number" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Event Preferences</h3>
            <FormField label="Dietary Restrictions">
              <textarea
                {...register('dietaryRestrictions')}
                className="w-full p-3 border rounded-lg"
                placeholder="Any dietary restrictions or allergies?"
              />
            </FormField>
            <FormField label="Special Requirements">
              <textarea
                {...register('specialRequirements')}
                className="w-full p-3 border rounded-lg"
                placeholder="Any accessibility needs or special requirements?"
              />
            </FormField>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Confirmation</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Event Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {new Date(event.startDateTime).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Address:</strong> {event.address}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Your Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {watch('firstName')} {watch('lastName')}</p>
                <p><strong>Email:</strong> {watch('email')}</p>
                <p><strong>Phone:</strong> {watch('phone') || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for {event.title}</CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-16 h-1 mx-2 ${stepNum < step ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleStepSubmit)}>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            
            <Button type="submit" disabled={loading}>
              {step < 3 ? 'Next' : loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}