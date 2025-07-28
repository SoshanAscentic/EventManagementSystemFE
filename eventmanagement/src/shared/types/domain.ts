export interface EventDto {
  id: number
  title: string
  description: string
  startDateTime: string
  endDateTime: string
  venue: string
  address: string
  city?: string
  country?: string
  capacity: number
  eventType: string
  categoryId: number
  categoryName: string
  currentRegistrations: number
  remainingCapacity: number
  isRegistrationOpen: boolean
  primaryImageUrl?: string
  images: EventImageDto[]
  createdAt: string
  updatedAt: string
  isUserRegistered?: boolean
}

export interface EventImageDto {
  id: number
  url: string
  isPrimary: boolean
  altText?: string
}

export interface CategoryDto {
  id: number
  name: string
  description?: string
  isActive: boolean
  eventCount: number
  createdAt: string
  updatedAt: string
  color?: string
  icon?: string
  parentId?: number
  level?: number
}
export interface UserDto {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  dateOfBirth?: string
  bio?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  roles: string[]
}

export interface NotificationDto {
  id: string
  title: string
  message: string
  type: NotificationType
  createdAt: string
  data: Record<string, any>
  actionUrl?: string
  isRead: boolean
  userId: number
}

export enum NotificationType {
  Info = 0,
  Success = 1,
  Warning = 2,
  Error = 3,
  EventCreated = 4,
  EventUpdated = 5,
  EventCancelled = 6,
  RegistrationConfirmed = 7,
  RegistrationCancelled = 8,
  EventReminder = 9,
  EventCapacityReached = 10
}
