import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for Kenya Shillings
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format dates for local timezone
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

// Validate phone number (Kenya format)
export function isValidPhoneNumber(phone: string): boolean {
  const kenyaPhoneRegex = /^(\+254|0)(7|1)[0-9]{8}$/
  return kenyaPhoneRegex.test(phone.replace(/\s/g, ''))
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format phone number to international format
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`
  }
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.slice(1)}`
  }
  return phone
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

// Get status color classes (matching Django backend)
export function getStatusColor(status: string): string {
  const statusColors = {
    // Service request statuses
    'open': 'badge-open',
    'acknowledged': 'badge-acknowledged',
    'assigned': 'badge-assigned',
    'in_progress': 'badge-assigned',
    'on_hold': 'badge-acknowledged',
    'resolved': 'badge-resolved',
    'closed': 'badge-resolved',
    'cancelled': 'badge-open',
    
    // Urgency levels
    'emergency': 'badge-emergency',
    'high': 'badge-high',
    'standard': 'badge-standard',
    'low': 'badge-low',
  }
  
  return statusColors[status.toLowerCase() as keyof typeof statusColors] || 'badge-standard'
}

// Get issue type colors
export function getIssueTypeColor(issueType: string): string {
  const colors = {
    'no_water': 'text-red-600 bg-red-50 border-red-200',
    'low_pressure': 'text-orange-600 bg-orange-50 border-orange-200',
    'pipe_burst': 'text-red-600 bg-red-50 border-red-200',
    'water_quality': 'text-purple-600 bg-purple-50 border-purple-200',
    'meter_problem': 'text-blue-600 bg-blue-50 border-blue-200',
    'billing_inquiry': 'text-green-600 bg-green-50 border-green-200',
    'connection_request': 'text-blue-600 bg-blue-50 border-blue-200',
    'disconnection': 'text-gray-600 bg-gray-50 border-gray-200',
    'other': 'text-gray-600 bg-gray-50 border-gray-200',
  }
  
  return colors[issueType as keyof typeof colors] || colors.other
}

// Format issue type display name
export function formatIssueType(issueType: string): string {
  const displayNames = {
    'no_water': 'No Water Supply',
    'low_pressure': 'Low Water Pressure',
    'pipe_burst': 'Pipe Burst/Leak',
    'water_quality': 'Water Quality Issue',
    'meter_problem': 'Meter Problem',
    'billing_inquiry': 'Billing Inquiry',
    'connection_request': 'New Connection Request',
    'disconnection': 'Service Disconnection',
    'other': 'Other Issue',
  }
  
  return displayNames[issueType as keyof typeof displayNames] || issueType
}

// Format status display name
export function formatStatus(status: string): string {
  const displayNames = {
    'open': 'Open',
    'acknowledged': 'Acknowledged',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'on_hold': 'On Hold',
    'resolved': 'Resolved',
    'closed': 'Closed',
    'cancelled': 'Cancelled',
  }
  
  return displayNames[status as keyof typeof displayNames] || status
}

// Format urgency display name
export function formatUrgency(urgency: string): string {
  const displayNames = {
    'emergency': 'Emergency',
    'high': 'High',
    'standard': 'Standard',
    'low': 'Low',
  }
  
  return displayNames[urgency as keyof typeof displayNames] || urgency
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Extract tenant from hostname or path
export function extractTenant(hostname?: string, pathname?: string): string {
  if (hostname) {
    // Extract from subdomain (e.g., demo.accesswash.org -> demo)
    if (hostname.includes('accesswash.org')) {
      return hostname.split('.')[0]
    }
  }
  
  if (pathname) {
    // Extract from path (e.g., /demo/portal -> demo)
    const segments = pathname.split('/')
    if (segments.length > 1 && segments[1]) {
      return segments[1]
    }
  }
  
  // Default fallback
  return 'demo'
}

// Sleep utility for testing
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}