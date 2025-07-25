export const APP_CONFIG = {
  name: 'EventHub',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || '/api',
} as const

export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PROFILE: {
    VIEW: '/profile',
    EDIT: '/profile/edit',
    REGISTRATIONS: '/profile/registrations',
    SETTINGS: '/profile/settings',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    EVENTS: '/admin/events',
    USERS: '/admin/users',
    CATEGORIES: '/admin/categories',
  },
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
  },
} as const

export const EVENT_TYPES = [
  'Conference',
  'Workshop',
  'Seminar',
  'Exhibition',
  'Networking',
  'Training',
  'Webinar',
  'Competition',
] as const

export const EVENT_CATEGORIES = [
  'Technology',
  'Business',
  'Arts',
  'Health',
  'Education',
  'Sports',
  'Entertainment',
  'Science',
] as const

export const NOTIFICATION_TYPES = {
  INFO: 0,
  SUCCESS: 1,
  WARNING: 2,
  ERROR: 3,
  EVENT_CREATED: 4,
  EVENT_UPDATED: 5,
  EVENT_CANCELLED: 6,
  REGISTRATION_CONFIRMED: 7,
  REGISTRATION_CANCELLED: 8,
  EVENT_REMINDER: 9,
  EVENT_CAPACITY_REACHED: 10,
} as const