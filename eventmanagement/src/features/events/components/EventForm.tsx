import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/molecules'
import { Input, Icon } from '@/components/atoms'
import { EventDto } from '@/shared/types/domain'
import { useGetCategoriesQuery } from '@/features/events/api/eventsApi'
import { EVENT_TYPES } from '@/shared/utils/constants'

  // Validation schema matching backend requirements
const eventSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  startDateTime: z.string()
    .min(1, 'Start date and time is required'),
  endDateTime: z.string()
    .min(1, 'End date and time is required'),
  venue: z.string()
    .min(1, 'Venue is required')
    .max(100, 'Venue must be less than 100 characters'),
  address: z.string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters'),
  city: z.string()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  country: z.string()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
  capacity: z.number()
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity cannot exceed 10,000'),
  eventType: z.string()
    .min(1, 'Event type is required'),
  categoryId: z.number()
    .min(1, 'Please select a category'),
}).refine((data) => {
  const start = new Date(data.startDateTime)
  const end = new Date(data.endDateTime)
  
  // End must be after start
  if (end <= start) {
    return false
  }
  
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDateTime']
}).refine((data) => {
  const start = new Date(data.startDateTime)
  const now = new Date()
  
  // For new events, start must be in future (skip this check for edits)
  return true // We'll handle this validation in the component
}, {
  message: 'Start date must be in the future',
  path: ['startDateTime']
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  event?: EventDto
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
  isEdit?: boolean
}

export const EventForm = ({ event, onSubmit, loading, isEdit = false }: EventFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ activeOnly: true })
  const categories = categoriesData?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime.slice(0, 16), // Convert to datetime-local format
      endDateTime: event.endDateTime.slice(0, 16),
      venue: event.venue,
      address: event.address,
      city: event.city || '',
      country: event.country || '',
      capacity: event.capacity,
      eventType: event.eventType,
      categoryId: event.categoryId,
    } : {
      capacity: 50,
      city: '',
      country: '',
    },
  })

  const watchedValues = watch()

  const handleFormSubmit = async (data: EventFormData) => {
    try {
      // Additional validation for new events
      if (!isEdit) {
        const start = new Date(data.startDateTime)
        const now = new Date()
        
        if (start <= now) {
          setValue('startDateTime', '', { shouldValidate: true })
          return // Let the form validation handle the error
        }
      }

      // Transform data to match API requirements
      const submitData = {
        title: data.title.trim(),
        description: data.description.trim(),
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        venue: data.venue.trim(),
        address: data.address.trim(),
        city: data.city?.trim() || undefined,
        country: data.country?.trim() || undefined,
        capacity: data.capacity,
        eventType: data.eventType,
        categoryId: data.categoryId,
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const nextStep = () => {
    setCurrentStep(Math.min(totalSteps, currentStep + 1))
  }

  const previousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Enter the essential details about your event</p>
            </div>

            <FormField label="Event Title" error={errors.title?.message} required>
              <Input 
                {...register('title')} 
                placeholder="Enter a descriptive title for your event"
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">
                {watchedValues.title?.length || 0}/200 characters
              </div>
            </FormField>

            <FormField label="Description" error={errors.description?.message} required>
              <textarea
                {...register('description')}
                className="w-full p-3 border rounded-lg min-h-[120px] resize-y focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Describe your event in detail..."
                maxLength={2000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {watchedValues.description?.length || 0}/2000 characters
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Event Type" error={errors.eventType?.message} required>
                <Select 
                  value={watchedValues.eventType || ''} 
                  onValueChange={(value) => setValue('eventType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Category" error={errors.categoryId?.message} required>
                <Select 
                  value={watchedValues.categoryId?.toString() || ''} 
                  onValueChange={(value) => setValue('categoryId', parseInt(value))}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label="Capacity" error={errors.capacity?.message} required>
              <Input 
                type="number" 
                {...register('capacity', { valueAsNumber: true })} 
                min={1}
                max={10000}
                placeholder="Maximum number of attendees"
              />
              <div className="text-xs text-gray-500 mt-1">
                Maximum 10,000 attendees
              </div>
            </FormField>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Date & Time</h3>
              <p className="text-gray-600">When will your event take place?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Start Date & Time" error={errors.startDateTime?.message} required>
                <Input 
                  type="datetime-local" 
                  {...register('startDateTime')}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </FormField>

              <FormField label="End Date & Time" error={errors.endDateTime?.message} required>
                <Input 
                  type="datetime-local" 
                  {...register('endDateTime')}
                  min={watchedValues.startDateTime || new Date().toISOString().slice(0, 16)}
                />
              </FormField>
            </div>

            {watchedValues.startDateTime && watchedValues.endDateTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Event Duration</h4>
                <p className="text-blue-800 text-sm">
                  {(() => {
                    const start = new Date(watchedValues.startDateTime)
                    const end = new Date(watchedValues.endDateTime)
                    const durationMs = end.getTime() - start.getTime()
                    const hours = Math.floor(durationMs / (1000 * 60 * 60))
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
                    
                    if (hours > 0) {
                      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `and ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
                    } else {
                      return `${minutes} minute${minutes > 1 ? 's' : ''}`
                    }
                  })()}
                </p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Details</h3>
              <p className="text-gray-600">Where will your event be held?</p>
            </div>

            <FormField label="Venue Name" error={errors.venue?.message} required>
              <Input 
                {...register('venue')} 
                placeholder="e.g., Grand Conference Center"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">
                {watchedValues.venue?.length || 0}/100 characters
              </div>
            </FormField>

            <FormField label="Street Address" error={errors.address?.message} required>
              <Input 
                {...register('address')} 
                placeholder="e.g., 123 Main Street, Suite 100"
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">
                {watchedValues.address?.length || 0}/200 characters
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="City" error={errors.city?.message}>
                <Input 
                  {...register('city')} 
                  placeholder="e.g., New York"
                  maxLength={100}
                />
              </FormField>

              <FormField label="Country" error={errors.country?.message}>
                <Input 
                  {...register('country')} 
                  placeholder="e.g., United States"
                  maxLength={100}
                />
              </FormField>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderSummary = () => {
    if (currentStep !== totalSteps) return null

    return (
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Event Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Title:</strong> {watchedValues.title || 'Not set'}</p>
            <p><strong>Type:</strong> {watchedValues.eventType || 'Not set'}</p>
            <p><strong>Capacity:</strong> {watchedValues.capacity || 0} people</p>
          </div>
          <div>
            <p><strong>Start:</strong> {watchedValues.startDateTime ? new Date(watchedValues.startDateTime).toLocaleString() : 'Not set'}</p>
            <p><strong>End:</strong> {watchedValues.endDateTime ? new Date(watchedValues.endDateTime).toLocaleString() : 'Not set'}</p>
            <p><strong>Venue:</strong> {watchedValues.venue || 'Not set'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${i + 1 <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`
                  flex-1 h-1 mx-4 rounded transition-colors
                  ${i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {renderStep()}
        {renderSummary()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 1}
            className="bg-white hover:bg-gray-50"
          >
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Icon name={isEdit ? "Save" : "Plus"} className="mr-2 h-4 w-4" />
                  {isEdit ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}