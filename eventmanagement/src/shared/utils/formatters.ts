/**
 * Date and Time Formatting Utilities
 */

export const formatDate = (
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  // Handle null/undefined values
  if (!date) {
    return 'No date available'
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Check if the date is valid
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
 
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
 
    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options })
  } catch (error) {
    console.warn('Error formatting date:', date, error)
    return 'Invalid date'
  }
}

export const formatShortDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'No date'
  
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatLongDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'No date available'
  
  return formatDate(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'No time'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      return 'Invalid time'
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.warn('Error formatting time:', date, error)
    return 'Invalid time'
  }
}

export const formatTime24Hour = (date: string | Date | null | undefined): string => {
  if (!date) return 'No time'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      return 'Invalid time'
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    console.warn('Error formatting time:', date, error)
    return 'Invalid time'
  }
}

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'No date/time'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      return 'Invalid date/time'
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.warn('Error formatting datetime:', date, error)
    return 'Invalid date/time'
  }
}

export const formatEventDateTime = (
  startDate: string | Date | null | undefined, 
  endDate?: string | Date | null | undefined
): string => {
  // Handle missing start date
  if (!startDate) {
    return 'Date not available'
  }

  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate
    
    // Validate start date
    if (start instanceof Date && isNaN(start.getTime())) {
      return 'Invalid start date'
    }
 
    const dateStr = formatLongDate(start)
    const startTime = formatTime(start)
 
    // If no end date provided
    if (!endDate) {
      return `${dateStr} at ${startTime}`
    }

    const end = typeof endDate === 'string' ? new Date(endDate) : endDate
    
    // Validate end date
    if (end instanceof Date && isNaN(end.getTime())) {
      return `${dateStr} at ${startTime} (end time unavailable)`
    }
 
    const endTime = formatTime(end)
    const sameDay = start.toDateString() === end.toDateString()
 
    if (sameDay) {
      return `${dateStr}, ${startTime} - ${endTime}`
    } else {
      return `${dateStr} at ${startTime} - ${formatLongDate(end)} at ${endTime}`
    }
  } catch (error) {
    console.warn('Error formatting event datetime:', startDate, endDate, error)
    return 'Invalid event date'
  }
}

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'Unknown time'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      return 'Invalid time'
    }
    
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
  } catch (error) {
    console.warn('Error formatting relative time:', date, error)
    return 'Unknown time'
  }
}

export const formatTimeUntil = (date: string | Date | null | undefined): string => {
  if (!date) return 'No date set'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
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
  } catch (error) {
    console.warn('Error formatting time until:', date, error)
    return 'Unknown'
  }
}

export const formatDateRange = (
  startDate: string | Date | null | undefined, 
  endDate: string | Date | null | undefined
): string => {
  if (!startDate && !endDate) return 'No dates available'
  if (!startDate) return `Ends ${formatDate(endDate)}`
  if (!endDate) return `Starts ${formatDate(startDate)}`
  
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate
 
    if ((start instanceof Date && isNaN(start.getTime())) || 
        (end instanceof Date && isNaN(end.getTime()))) {
      return 'Invalid date range'
    }
 
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
  } catch (error) {
    console.warn('Error formatting date range:', startDate, endDate, error)
    return 'Invalid date range'
  }
}

/**
 * Number and Currency Formatting Utilities
 */

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'
  }
  
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatCompactNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'
  }
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

export const formatPercentage = (num: number, decimals = 1): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0%'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100)
}

export const formatDecimal = (num: number, decimals = 2): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'
  }
  
  return num.toFixed(decimals)
}

export const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return '0 B'
  }
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
 
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
 
  return `${size.toFixed(1)} ${sizes[i]}`
}

/**
 * Text Formatting Utilities
 */

export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text || typeof text !== 'string') return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export const truncateWords = (text: string | null | undefined, maxWords: number): string => {
  if (!text || typeof text !== 'string') return ''
  const words = text.split(' ')
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '...'
}

export const capitalizeFirst = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') return ''
  return text.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

export const camelCaseToTitle = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export const slugify = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone || typeof phone !== 'string') return ''
  const cleaned = phone.replace(/\D/g, '')
 
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
 
  return phone // Return original if not recognizable format
}

export const formatSSN = (ssn: string | null | undefined): string => {
  if (!ssn || typeof ssn !== 'string') return ''
  const cleaned = ssn.replace(/\D/g, '')
 
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
  }
 
  return ssn
}

export const maskEmail = (email: string | null | undefined): string => {
  if (!email || typeof email !== 'string') return ''
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
 
  const maskedLocal = local.length > 2
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : '*'.repeat(local.length)
 
  return `${maskedLocal}@${domain}`
}

export const maskCreditCard = (cardNumber: string | null | undefined): string => {
  if (!cardNumber || typeof cardNumber !== 'string') return ''
  const cleaned = cardNumber.replace(/\D/g, '')
  return cleaned.replace(/\d(?=\d{4})/g, '*')
}

/**
 * Validation and Utility Formatters
 */

export const formatValidationErrors = (errors: Record<string, string[]>): string[] => {
  return Object.values(errors).flat()
}

export const formatUserName = (firstName: string | null | undefined, lastName: string | null | undefined): string => {
  const first = firstName || ''
  const last = lastName || ''
  return `${first} ${last}`.trim()
}

export const formatUserInitials = (firstName: string | null | undefined, lastName: string | null | undefined): string => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
}

export const formatEventCapacity = (current: number, total: number): string => {
  if (typeof current !== 'number' || typeof total !== 'number' || total === 0) {
    return 'Capacity unknown'
  }
  
  const percentage = (current / total) * 100
 
  if (percentage >= 90) return `${total - current} spots left`
  if (percentage >= 75) return `${total - current} spots remaining`
  if (current === total) return 'Sold out'
 
  return `${current}/${total} registered`
}

export const formatRegistrationStatus = (status: string | null | undefined): string => {
  if (!status || typeof status !== 'string') return 'Unknown'
  
  const statusMap: Record<string, string> = {
    'active': 'Confirmed',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'waitlist': 'Waitlisted',
    'checkedIn': 'Checked In',
  }
 
  return statusMap[status.toLowerCase()] || capitalizeFirst(status)
}

export const formatEventType = (type: string | null | undefined): string => {
  if (!type || typeof type !== 'string') return 'Unknown'
  
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
  street: string | null | undefined,
  city: string | null | undefined,
  state?: string | null | undefined,
  zipCode?: string | null | undefined,
  country?: string | null | undefined
): string => {
  const parts = []
  
  if (street) parts.push(street)
  if (city) parts.push(city)
  if (state) parts.push(state)
  if (zipCode && parts.length > 0) {
    parts[parts.length - 1] += ` ${zipCode}`
  }
  if (country && country !== 'US') parts.push(country)
 
  return parts.length > 0 ? parts.join(', ') : 'Address not available'
}

export const formatShortAddress = (
  city: string | null | undefined, 
  state?: string | null | undefined, 
  country?: string | null | undefined
): string => {
  const parts = []
 
  if (city) parts.push(city)
  if (state) parts.push(state)
  if (country && country !== 'US') parts.push(country)
 
  return parts.length > 0 ? parts.join(', ') : 'Location not available'
}

/**
 * Social Media and URL Formatters
 */

export const formatUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string') return ''
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

export const formatSocialHandle = (handle: string | null | undefined, platform: string): string => {
  if (!handle || typeof handle !== 'string') return ''
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
  if (typeof count !== 'number' || isNaN(count)) return singular
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + 's'}`
}

export const formatList = (items: string[], conjunction = 'and'): string => {
  if (!Array.isArray(items) || items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
 
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`
}

export const formatJson = (obj: any, spaces = 2): string => {
  try {
    return JSON.stringify(obj, null, spaces)
  } catch (error) {
    return 'Invalid JSON'
  }
}

export const formatSearchQuery = (query: string | null | undefined): string => {
  if (!query || typeof query !== 'string') return ''
  return query.trim().toLowerCase().replace(/\s+/g, ' ')
}