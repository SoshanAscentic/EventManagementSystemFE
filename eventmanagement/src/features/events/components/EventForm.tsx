import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/molecules'
import { Input, Icon } from '@/components/atoms'
import { eventSchema } from '@/shared/utils/validators'
import { EventDto } from '@/shared/types/domain'

interface EventFormProps {
  event?: EventDto
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

export const EventForm = ({ event, onSubmit, loading }: EventFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime.slice(0, 16),
      endDateTime: event.endDateTime.slice(0, 16),
      venue: event.venue,
      address: event.address,
      capacity: event.capacity,
      eventType: event.eventType as "Conference" | "Workshop" | "Seminar" | "Exhibition" | "Networking" | "Training" | "Webinar" | "Competition",
      categoryId: event.categoryId,
    } : {},
  })

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormField label="Event Title" error={errors.title?.message} required>
              <Input {...register('title')} placeholder="Enter event title" />
            </FormField>
            
            <FormField label="Description" error={errors.description?.message} required>
              <textarea
                {...register('description')}
                className="w-full p-3 border rounded-lg min-h-[120px]"
                placeholder="Describe your event..."
              />
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Event Type" error={errors.eventType?.message} required>
                <select {...register('eventType')} className="w-full p-3 border rounded-lg">
                  <option value="">Select type</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Exhibition">Exhibition</option>
                </select>
              </FormField>
              
              <FormField label="Capacity" error={errors.capacity?.message} required>
                <Input type="number" {...register('capacity', { valueAsNumber: true })} />
              </FormField>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date & Time" error={errors.startDateTime?.message} required>
                <Input type="datetime-local" {...register('startDateTime')} />
              </FormField>
              
              <FormField label="End Date & Time" error={errors.endDateTime?.message} required>
                <Input type="datetime-local" {...register('endDateTime')} />
              </FormField>
            </div>
            
            <FormField label="Venue" error={errors.venue?.message} required>
              <Input {...register('venue')} placeholder="Event venue name" />
            </FormField>
            
            <FormField label="Address" error={errors.address?.message} required>
              <Input {...register('address')} placeholder="Full address" />
            </FormField>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Event Summary</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {watch('title')}</p>
                <p><strong>Type:</strong> {watch('eventType')}</p>
                <p><strong>Date:</strong> {watch('startDateTime')}</p>
                <p><strong>Venue:</strong> {watch('venue')}</p>
                <p><strong>Capacity:</strong> {watch('capacity')} people</p>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="Calendar" className="mr-2 h-5 w-5" />
          {event ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mt-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i + 1 <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : event ? 'Update Event' : 'Create Event'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}