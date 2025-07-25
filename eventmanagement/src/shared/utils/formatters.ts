/**
 * Date and Time Formatting Utilities
 */

export const formatDate = (
  date: string | Date, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export const formatShortDate = (date: string | Date): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatLongDate = (date: string | Date): string => {
  return formatDate(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime24Hour = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatEventDateTime = (startDate: string | Date, endDate?: string | Date): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : null
  
  const dateStr = formatLongDate(start)
  const startTime = formatTime(start)
  
  if (!end) {
    return `${dateStr} at ${startTime}`
  }
  
  const endTime = formatTime(end)
  const sameDay = start.toDateString() === end.toDateString()
  
  if (sameDay) {
    return `${dateStr}, ${startTime} - ${endTime}`
  } else {
    return `${dateStr} at ${startTime} - ${formatLongDate(end)} at ${endTime}`
  }
}

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

export const formatTimeUntil = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = dateObj.getTime() - now.getTime()
  
  if (diff <= 0) return 'Event has passed'
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  
  if (months > 0) return `in ${months} month${months > 1 ? 's' : ''}`
  if (weeks > 0) return `in ${weeks} week${weeks > 1 ? 's' : ''}`
  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`
  return 'Starting soon'
}

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()
  const sameDay = sameMonth && start.getDate() === end.getDate()
  
  if (sameDay) {
    return formatDate(start)
  } else if (sameMonth) {
    return `${start.getDate()} - ${formatDate(end)}`
  } else if (sameYear) {
    return `${formatDate(start, { month: 'short', day: 'numeric' })} - ${formatDate(end)}`
  } else {
    return `${formatShortDate(start)} - ${formatShortDate(end)}`
  }
}

/**
 * Number and Currency Formatting Utilities
 */

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

export const formatPercentage = (num: number, decimals = 1): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100)
}

export const formatDecimal = (num: number, decimals = 2): string => {
  return num.toFixed(decimals)
}

export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  
  return `${size.toFixed(1)} ${sizes[i]}`
}

/**
 * Text Formatting Utilities
 */

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export const truncateWords = (text: string, maxWords: number): string => {
  const words = text.split(' ')
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '...'
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const capitalizeWords = (text: string): string => {
  return text.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

export const camelCaseToTitle = (text: string): string => {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone // Return original if not recognizable format
}

export const formatSSN = (ssn: string): string => {
  const cleaned = ssn.replace(/\D/g, '')
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
  }
  
  return ssn
}

export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  
  const maskedLocal = local.length > 2 
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : '*'.repeat(local.length)
    
  return `${maskedLocal}@${domain}`
}

export const maskCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '')
  return cleaned.replace(/\d(?=\d{4})/g, '*')
}

/**
 * Validation and Utility Formatters
 */

export const formatValidationErrors = (errors: Record<string, string[]>): string[] => {
  return Object.values(errors).flat()
}

export const formatUserName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim()
}

export const formatUserInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const formatEventCapacity = (current: number, total: number): string => {
  const percentage = (current / total) * 100
  
  if (percentage >= 90) return `${total - current} spots left`
  if (percentage >= 75) return `${total - current} spots remaining`
  if (current === total) return 'Sold out'
  
  return `${current}/${total} registered`
}

export const formatRegistrationStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'waitlist': 'Waitlisted',
    'checkedIn': 'Checked In',
  }
  
  return statusMap[status.toLowerCase()] || capitalizeFirst(status)
}

export const formatEventType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'conference': 'Conference',
    'workshop': 'Workshop',
    'seminar': 'Seminar',
    'networking': 'Networking Event',
    'training': 'Training Session',
    'webinar': 'Webinar',
    'exhibition': 'Exhibition',
    'competition': 'Competition',
  }
  
  return typeMap[type.toLowerCase()] || capitalizeWords(type)
}

/**
 * Address and Location Formatters
 */

export const formatAddress = (
  street: string,
  city: string,
  state?: string,
  zipCode?: string,
  country?: string
): string => {
  const parts = [street, city]
  
  if (state) parts.push(state)
  if (zipCode) parts[parts.length - 1] += ` ${zipCode}`
  if (country && country !== 'US') parts.push(country)
  
  return parts.join(', ')
}

export const formatShortAddress = (city: string, state?: string, country?: string): string => {
  const parts = [city]
  
  if (state) parts.push(state)
  if (country && country !== 'US') parts.push(country)
  
  return parts.join(', ')
}

/**
 * Social Media and URL Formatters
 */

export const formatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

export const formatSocialHandle = (handle: string, platform: string): string => {
  const cleaned = handle.replace(/^@/, '')
  
  const baseUrls: Record<string, string> = {
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/in/',
    github: 'https://github.com/',
  }
  
  const baseUrl = baseUrls[platform.toLowerCase()]
  return baseUrl ? `${baseUrl}${cleaned}` : `@${cleaned}`
}

/**
 * Utility Functions
 */

export const formatPlural = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + 's'}`
}

export const formatList = (items: string[], conjunction = 'and'): string => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
  
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`
}

export const formatJson = (obj: any, spaces = 2): string => {
  return JSON.stringify(obj, null, spaces)
}

export const formatSearchQuery = (query: string): string => {
  return query.trim().toLowerCase().replace(/\s+/g, ' ')
}