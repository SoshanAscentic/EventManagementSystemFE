import { useState, useCallback } from 'react'
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
import { 
  useUploadEventImageMutation, 
  useSetImageAsPrimaryMutation, 
  useDeleteEventImageMutation 
} from '@/features/events/api/eventsApi'
import { EVENT_TYPES } from '@/shared/utils/constants'
import { cn } from '@/lib/utils'

// Validation schema with conditional validation for each step
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
  
  if (end <= start) {
    return false
  }
  
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDateTime']
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  event?: EventDto
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
  isEdit?: boolean
}

// Default event image placeholder
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'

export const EventForm = ({ event, onSubmit, loading, isEdit = false }: EventFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [uploadedImages, setUploadedImages] = useState<any[]>(event?.images || [])
  const [primaryImageUrl, setPrimaryImageUrl] = useState(event?.primaryImageUrl || DEFAULT_EVENT_IMAGE)
  const [useDefaultImage, setUseDefaultImage] = useState(!event?.primaryImageUrl)
  const [isUploading, setIsUploading] = useState(false)

  // Image management mutations
  const [uploadImage] = useUploadEventImageMutation()
  const [setImageAsPrimary] = useSetImageAsPrimaryMutation()
  const [deleteImage] = useDeleteEventImageMutation()

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ activeOnly: true })
  const categories = categoriesData?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: event ? {
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime.slice(0, 16),
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

  // Fix the validateStep function to match getStepStatus logic
  const validateStep = async (step: number): Promise<boolean> => {
    const values = getValues()
    console.log('Validating step', step, 'with values:', values)
    
    switch (step) {
      case 1:
        // Check all required fields for step 1
        const step1Valid = !!(values.title && values.description && values.eventType && values.categoryId && values.capacity)
        console.log('Step 1 validation:', step1Valid)
        return step1Valid
      case 2:
        // Check all required fields for step 2
        const step2Valid = !!(values.startDateTime && values.endDateTime)
        console.log('Step 2 validation:', step2Valid)
        return step2Valid
      case 3:
        // Check all required fields for step 3
        const step3Valid = !!(values.venue && values.address)
        console.log('Step 3 validation:', step3Valid)
        return step3Valid
      case 4:
        console.log('Step 4 validation: always true')
        return true
      default:
        return true
    }
  }

  const handleImageUpload = useCallback(async (file: File, isPrimary = false) => {
    console.log('=== IMAGE UPLOAD START ===')
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type)
    console.log('Is primary:', isPrimary)
    console.log('Event ID:', event?.id)
    console.log('Is edit mode:', isEdit)
    
    try {
      // Validate file according to backend requirements
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 10 * 1024 * 1024 // 10MB as per backend spec
      
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
      }
      
      if (file.size > maxSize) {
        throw new Error('File size exceeds maximum limit of 10MB.')
      }
      
      // For new events (no event.id yet), store locally
      if (!event?.id) {
        console.log('Storing image locally for new event')
        const imageUrl = URL.createObjectURL(file)
        const newImage = {
          id: Date.now(), // Temporary ID
          url: imageUrl,
          isPrimary: isPrimary || uploadedImages.length === 0,
          file, // Store the file for later upload
          isNew: true
        }
        
        setUploadedImages(prev => [...prev, newImage])
        
        if (isPrimary || uploadedImages.length === 0) {
          setPrimaryImageUrl(imageUrl)
          setUseDefaultImage(false)
        }
        
        console.log('Image stored locally successfully')
        return
      }
  
      // For existing events, upload immediately
      console.log('Uploading image immediately for existing event')
      setIsUploading(true)
      
      const result = await uploadImage({
        eventId: event.id,
        file,
        isPrimary
      }).unwrap()
  
      console.log('Upload result:', result)
  
      if (result.success) {
        const imageId = result.data
        
        // Create image object for local state
        const newImage = {
          id: imageId,
          url: URL.createObjectURL(file),
          isPrimary,
          file: undefined,
          isNew: false
        }
        
        setUploadedImages(prev => [...prev, newImage])
        
        if (isPrimary) {
          setPrimaryImageUrl(newImage.url)
          setUseDefaultImage(false)
        }
        
        console.log('Image uploaded successfully')
        alert('Image uploaded successfully!')
        
      } else {
        throw new Error(result.errors?.join(', ') || 'Upload failed')
      }
    } catch (error: any) {
      console.error('=== IMAGE UPLOAD ERROR ===')
      console.error('Error details:', error)
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`)
      
      // Reset the file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } finally {
      setIsUploading(false)
      console.log('=== IMAGE UPLOAD END ===')
    }
  }, [event?.id, uploadImage, uploadedImages.length, isEdit])

    // Handle setting image as primary
    const handleSetPrimary = useCallback(async (imageId: number, imageUrl: string) => {
      if (event?.id) {
        try {
          const result = await setImageAsPrimary({
            eventId: event.id,
            imageId
          }).unwrap()
          
          // Check for success (transformed from isSuccess)
          if (result.success) {
            setPrimaryImageUrl(imageUrl)
            setUseDefaultImage(false)
            
            // Update the images list to reflect the change
            setUploadedImages(prev => prev.map(img => ({
              ...img,
              isPrimary: img.id === imageId
            })))
          } else {
            throw new Error(result.errors?.join(', ') || 'Failed to set primary image')
          }
        } catch (error: any) {
          console.error('Failed to set primary image:', error)
          alert(`Failed to set primary image: ${error.message || 'Unknown error'}`)
        }
      } else {
        // For new events, just update local state
        setPrimaryImageUrl(imageUrl)
        setUseDefaultImage(false)
        setUploadedImages(prev => prev.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        })))
      }
    }, [event?.id, setImageAsPrimary])
    
    // Handle image deletion
    const handleDeleteImage = useCallback(async (imageId: number) => {
      if (event?.id) {
        try {
          const result = await deleteImage({
            eventId: event.id,
            imageId
          }).unwrap()
          
          // Check for success (transformed from isSuccess)
          if (result.success) {
            const deletedImage = uploadedImages.find(img => img.id === imageId)
            if (deletedImage?.isPrimary) {
              // If deleting primary image, set default or next available
              const remainingImages = uploadedImages.filter(img => img.id !== imageId)
              if (remainingImages.length > 0) {
                setPrimaryImageUrl(remainingImages[0].url)
              } else {
                setPrimaryImageUrl(DEFAULT_EVENT_IMAGE)
                setUseDefaultImage(true)
              }
            }
            
            setUploadedImages(prev => prev.filter(img => img.id !== imageId))
          } else {
            throw new Error(result.errors?.join(', ') || 'Failed to delete image')
          }
        } catch (error: any) {
          console.error('Failed to delete image:', error)
          alert(`Failed to delete image: ${error.message || 'Unknown error'}`)
        }
      } else {
        // For new events, just remove from local state
        const deletedImage = uploadedImages.find(img => img.id === imageId)
        if (deletedImage?.isPrimary) {
          const remainingImages = uploadedImages.filter(img => img.id !== imageId)
          if (remainingImages.length > 0) {
            setPrimaryImageUrl(remainingImages[0].url)
          } else {
            setPrimaryImageUrl(DEFAULT_EVENT_IMAGE)
            setUseDefaultImage(true)
          }
        }
        
        setUploadedImages(prev => prev.filter(img => img.id !== imageId))
      }
    }, [event?.id, deleteImage, uploadedImages])
    
    // Updated file input validation
    const validateAndHandleFileUpload = (file: File) => {
      // Client-side validation before upload
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return false
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 10MB')
        return false
      }
      
      return true
    }


  const handleFormSubmit = async (data: EventFormData) => {
    console.log('=== FORM SUBMISSION DEBUG ===')
    console.log('Form data received:', data)
    console.log('Current step:', currentStep)
    console.log('Total steps:', totalSteps)
    console.log('Is editing:', isEdit)
    console.log('Loading state:', loading)
    
    try {
      if (!isEdit) {
        const start = new Date(data.startDateTime)
        const now = new Date()
        
        console.log('Start date:', start)
        console.log('Current date:', now)
        console.log('Is start date valid:', start > now)
        
        if (start <= now) {
          console.error('Start date is in the past')
          setValue('startDateTime', '', { shouldValidate: true })
          return
        }
      }

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
        // Include image information
        useDefaultImage,
        newImages: uploadedImages.filter(img => img.isNew), // For new events
      }

      console.log('Prepared submit data:', submitData)
      console.log('About to call onSubmit...')
      
      await onSubmit(submitData)
      console.log('onSubmit completed successfully')
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Update nextStep function to prevent form submission
  const nextStep = async () => {
    console.log('=== NEXT STEP DEBUG ===')
    console.log('Current step:', currentStep)
    console.log('Total steps:', totalSteps)
    console.log('Should show Next button:', currentStep < totalSteps)
    
    const values = getValues()
    console.log('Form values for validation:', {
      venue: values.venue,
      address: values.address,
      title: values.title,
      description: values.description
    })
    
    const isValid = await validateStep(currentStep)
    console.log('Step', currentStep, 'is valid:', isValid)
    
    if (isValid && currentStep < totalSteps) {
      const newStep = currentStep + 1
      console.log('Setting step to:', newStep)
      setCurrentStep(newStep)
    } else {
      console.log('Cannot proceed to next step. Valid:', isValid, 'Current < Total:', currentStep < totalSteps)
      // Trigger validation to show errors
      await trigger()
    }
  }

  const previousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1))
  }

  // Also update the getStepStatus function to be more explicit
  const getStepStatus = (step: number) => {
    const values = getValues()
    
    switch (step) {
      case 1:
        const step1Valid = !!(values.title && values.description && values.eventType && values.categoryId && values.capacity)
        console.log('Step 1 status:', step1Valid, { title: values.title, description: values.description, eventType: values.eventType, categoryId: values.categoryId, capacity: values.capacity })
        return step1Valid
      case 2:
        const step2Valid = !!(values.startDateTime && values.endDateTime)
        console.log('Step 2 status:', step2Valid, { startDateTime: values.startDateTime, endDateTime: values.endDateTime })
        return step2Valid
      case 3:
        const step3Valid = !!(values.venue && values.address)
        console.log('Step 3 status:', step3Valid, { venue: values.venue, address: values.address })
        return step3Valid
      case 4:
        console.log('Step 4 status: always true')
        return true
      default:
        return false
    }
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

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Images</h3>
              <p className="text-gray-600">Add images to make your event more appealing</p>
            </div>

            {/* Current Primary Image */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Primary Image</h4>
              <div className="relative">
                <img
                  src={primaryImageUrl}
                  alt="Event preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                {useDefaultImage && (
                  <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    Default Image
                  </div>
                )}
              </div>
            </div>

            {/* Default Image Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useDefault"
                checked={useDefaultImage}
                onChange={(e) => {
                  setUseDefaultImage(e.target.checked)
                  if (e.target.checked) {
                    setPrimaryImageUrl(DEFAULT_EVENT_IMAGE)
                  } else if (uploadedImages.length > 0) {
                    const primaryImg = uploadedImages.find(img => img.isPrimary) || uploadedImages[0]
                    setPrimaryImageUrl(primaryImg.url)
                  }
                }}
                className="rounded"
              />
              <label htmlFor="useDefault" className="text-sm font-medium text-gray-700">
                Use default event image
              </label>
            </div>

            {/* Image Upload */}
{!useDefaultImage && (
  <div className="space-y-4">
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => {
          console.log('=== FILE INPUT CHANGE ===')
          const file = e.target.files?.[0]
          console.log('Selected file:', file)
          
          if (file) {
            // Validate file size
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
              alert('File size must be less than 10MB')
              e.target.value = '' // Clear the input
              return
            }
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
              alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
              e.target.value = '' // Clear the input
              return
            }
            
            console.log('File validation passed, calling handleImageUpload')
            handleImageUpload(file, uploadedImages.length === 0)
          }
        }}
        className="hidden"
        id="image-upload"
        disabled={isUploading}
      />
      <label
        htmlFor="image-upload"
        className={cn(
          "cursor-pointer flex flex-col items-center justify-center text-center",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Icon name="Upload" className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          {isUploading ? 'Uploading...' : 'Click to upload an image'}
        </p>
        <p className="text-xs text-gray-500">
          JPEG, PNG, GIF or WebP (max 10MB)
        </p>
      </label>
    </div>

    {/* Uploaded Images Grid */}
    {uploadedImages.length > 0 && (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">
          Uploaded Images ({uploadedImages.length})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt="Event image"
                className="w-full h-24 object-cover rounded-lg border"
              />
              {image.isPrimary && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                  Primary
                </div>
              )}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                {!image.isPrimary && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSetPrimary(image.id, image.url)
                    }}
                  >
                    <Icon name="Star" className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDeleteImage(image.id)
                  }}
                >
                  <Icon name="Trash2" className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
            
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
            <p><strong>Venue:</strong> {watchedValues.venue || 'Not set'}</p>
          </div>
          <div>
            <p><strong>Start:</strong> {watchedValues.startDateTime ? new Date(watchedValues.startDateTime).toLocaleString() : 'Not set'}</p>
            <p><strong>End:</strong> {watchedValues.endDateTime ? new Date(watchedValues.endDateTime).toLocaleString() : 'Not set'}</p>
            <p><strong>Images:</strong> {useDefaultImage ? 'Default image' : `${uploadedImages.length} uploaded`}</p>
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
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer
                ${i + 1 <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : getStepStatus(i + 1)
                  ? 'bg-green-100 text-green-600 border-2 border-green-300'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
              onClick={() => {
                // Allow skipping to any step if current step has minimum data
                // Or if going to a previous step
                if (i + 1 <= currentStep || getStepStatus(currentStep)) {
                  setCurrentStep(i + 1)
                }
              }}
              >
                {getStepStatus(i + 1) && i + 1 < currentStep ? (
                  <Icon name="Check" className="h-4 w-4" />
                ) : (
                  i + 1
                )}
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
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Date & Time' :
              currentStep === 3 ? 'Location Details' :
              'Event Images'
            }
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
              onClick={(e) => {
                e.preventDefault() // Prevent form submission
                console.log('Next button clicked, current step:', currentStep, 'total steps:', totalSteps)
                nextStep()
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!getStepStatus(currentStep)}
            >
              Next
              <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                console.log('=== SUBMIT BUTTON CLICKED ===')
                console.log('Event:', e)
                console.log('Button disabled:', loading)
                console.log('Current step:', currentStep)
                console.log('Total steps:', totalSteps)
                
                // Let the form handle the submission naturally
                // Don't prevent default here
              }}
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

