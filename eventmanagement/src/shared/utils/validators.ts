import { z } from 'zod'

// ===== AUTH VALIDATION SCHEMAS =====

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z.object({
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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// ===== EVENT VALIDATION SCHEMAS =====

export const eventSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  startDateTime: z.string()
    .min(1, 'Start date and time is required')
    .refine((date) => {
      const startDate = new Date(date)
      const now = new Date()
      return startDate > now
    }, {
      message: 'Start date must be in the future',
    }),
  endDateTime: z.string()
    .min(1, 'End date and time is required'),
  venue: z.string()
    .min(1, 'Venue is required')
    .max(200, 'Venue name must be less than 200 characters'),
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address must be less than 500 characters'),
  city: z.string()
    .max(100, 'City name must be less than 100 characters')
    .optional(),
  country: z.string()
    .max(100, 'Country name must be less than 100 characters')
    .optional(),
  capacity: z.number()
    .min(1, 'Capacity must be at least 1')
    .max(50000, 'Capacity cannot exceed 50,000'),
  eventType: z.enum([
    'Conference',
    'Workshop',
    'Seminar',
    'Exhibition',
    'Networking',
    'Training',
    'Webinar',
    'Competition'
  ], {
    required_error: 'Event type is required',
    invalid_type_error: 'Please select a valid event type',
  }),
  categoryId: z.number()
    .min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  maxRegistrationsPerUser: z.number().min(1).optional(),
}).refine((data) => {
  const startDate = new Date(data.startDateTime)
  const endDate = new Date(data.endDateTime)
  return endDate > startDate
}, {
  message: 'End date must be after start date',
  path: ['endDateTime'],
})

export const eventUpdateSchema = eventSchema.partial().extend({
  id: z.number().min(1, 'Event ID is required'),
})

// ===== REGISTRATION VALIDATION SCHEMAS =====

export const eventRegistrationSchema = z.object({
  eventId: z.number().min(1, 'Event ID is required'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  company: z.string().max(200, 'Company name too long').optional(),
  jobTitle: z.string().max(100, 'Job title too long').optional(),
  dietaryRestrictions: z.string().max(500, 'Dietary restrictions too long').optional(),
  specialRequirements: z.string().max(500, 'Special requirements too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  emergencyContactName: z.string().max(100, 'Emergency contact name too long').optional(),
  emergencyContactPhone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  subscribeToUpdates: z.boolean().optional(),
})

// ===== CATEGORY VALIDATION SCHEMAS =====

export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  isActive: z.boolean().optional().default(true),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use hex color)')
    .optional(),
  icon: z.string().max(50, 'Icon name too long').optional(),
})

export const categoryUpdateSchema = categorySchema.partial().extend({
  id: z.number().min(1, 'Category ID is required'),
})

// ===== PROFILE VALIDATION SCHEMAS =====

export const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  dateOfBirth: z.string()
    .refine((date) => {
      if (!date) return true
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 13 && age <= 120
    }, {
      message: 'Age must be between 13 and 120 years',
    })
    .optional(),
  bio: z.string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  company: z.string()
    .max(200, 'Company name too long')
    .optional(),
  jobTitle: z.string()
    .max(100, 'Job title too long')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  }).optional(),
})

// ===== CONTACT FORM VALIDATION SCHEMA =====

export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject too long'),
  message: z.string()
    .min(1, 'Message is required')
    .max(2000, 'Message too long'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

// ===== SEARCH AND FILTER VALIDATION SCHEMAS =====

export const eventSearchSchema = z.object({
  searchTerm: z.string().max(200, 'Search term too long').optional(),
  categoryId: z.number().positive('Invalid category ID').optional(),
  eventType: z.string().max(50, 'Event type too long').optional(),
  startDate: z.string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid start date format',
    })
    .optional(),
  endDate: z.string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid end date format',
    })
    .optional(),
  location: z.string().max(200, 'Location too long').optional(),
  hasAvailableSpots: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string().max(50, 'Tag too long')).optional(),
  priceMin: z.number().min(0, 'Minimum price cannot be negative').optional(),
  priceMax: z.number().min(0, 'Maximum price cannot be negative').optional(),
  sortBy: z.enum([
    'title',
    'startDateTime',
    'createdAt',
    'capacity',
    'registrationCount'
  ]).optional(),
  ascending: z.boolean().optional(),
  pageNumber: z.number().min(1, 'Page number must be at least 1').optional(),
  pageSize: z.number()
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100')
    .optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
}).refine((data) => {
  if (data.priceMin && data.priceMax) {
    return data.priceMin <= data.priceMax
  }
  return true
}, {
  message: 'Maximum price must be greater than or equal to minimum price',
  path: ['priceMax'],
})

// ===== NOTIFICATION VALIDATION SCHEMAS =====

export const notificationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  message: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message too long'),
  type: z.enum(['info', 'success', 'warning', 'error']),
  targetUsers: z.array(z.number().positive()).optional(),
  actionUrl: z.string().url('Invalid action URL').optional(),
  data: z.record(z.any()).optional(),
  scheduleFor: z.string()
    .refine((date) => !date || new Date(date) > new Date(), {
      message: 'Scheduled time must be in the future',
    })
    .optional(),
})

// ===== ADMIN VALIDATION SCHEMAS =====

export const userManagementSchema = z.object({
  userId: z.number().min(1, 'User ID is required'),
  isActive: z.boolean(),
  roles: z.array(z.string().min(1, 'Role cannot be empty')),
  reason: z.string().max(500, 'Reason too long').optional(),
})

export const bulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'export']),
  targetIds: z.array(z.number().positive()).min(1, 'At least one item must be selected'),
  reason: z.string().max(500, 'Reason too long').optional(),
})

// ===== FILE UPLOAD VALIDATION SCHEMAS =====

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size must be less than 5MB',
    })
    .refine((file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      return allowedTypes.includes(file.type)
    }, {
      message: 'Only JPEG, PNG, WebP, and GIF files are allowed',
    }),
  altText: z.string().max(200, 'Alt text too long').optional(),
  isPrimary: z.boolean().optional(),
})

export const documentUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .refine((file) => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      return allowedTypes.includes(file.type)
    }, {
      message: 'Only PDF and Word documents are allowed',
    }),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
})

// ===== UTILITY VALIDATION FUNCTIONS =====

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

export const validatePhoneNumber = (phone: string): boolean => {
  return z.string().regex(/^[\+]?[1-9][\d]{0,15}$/).safeParse(phone).success
}

export const validateUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success
}

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ===== TYPE EXPORTS =====

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>
export type EventData = z.infer<typeof eventSchema>
export type EventUpdateData = z.infer<typeof eventUpdateSchema>
export type EventRegistrationData = z.infer<typeof eventRegistrationSchema>
export type CategoryData = z.infer<typeof categorySchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type EventSearchData = z.infer<typeof eventSearchSchema>
export type NotificationData = z.infer<typeof notificationSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema>