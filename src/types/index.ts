// API Response Types (matching Django backend)
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// Authentication Types (matching Django portal models)
export interface LoginCredentials {
  username: string // email or phone number - backend expects 'email' field
  password: string
}

export interface RegisterData {
  email: string
  phone_number: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  property_address: string
  account_number?: string
  meter_number?: string
  language?: string
}

// Customer Types (matching Django Customer model)
export interface Customer {
  id: string
  email: string
  phone_number?: string
  first_name: string
  last_name: string
  full_name: string
  account_number?: string
  meter_number?: string
  property_address?: string
  service_type?: 'residential' | 'commercial' | 'industrial' | 'institutional'
  language?: string
  email_verified?: boolean
  phone_verified?: boolean
  last_login?: string
  created_at: string
  // Additional fields that might come from your backend
  employee_id?: string
  avatar?: string
  location_tracking_consent?: boolean
  notification_preferences?: any
  is_active?: boolean
  date_joined?: string
}

// Service Request Types (matching Django support models)
export interface ServiceRequest {
  id: string
  request_number: string
  customer_name: string
  customer_email: string
  assigned_to_name?: string
  issue_type: 'no_water' | 'low_pressure' | 'pipe_burst' | 'water_quality' | 'meter_problem' | 'billing_inquiry' | 'connection_request' | 'disconnection' | 'other'
  issue_type_display: string
  title: string
  description: string
  urgency: 'emergency' | 'high' | 'standard' | 'low'
  urgency_display: string
  status: 'open' | 'acknowledged' | 'assigned' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'cancelled'
  status_display: string
  reported_location: string
  location_coordinates?: {
    type: 'Point'
    coordinates: [number, number]
  }
  priority_score: number
  resolution_notes?: string
  resolution_category?: 'resolved_field' | 'resolved_phone' | 'resolved_office' | 'duplicate' | 'invalid' | 'referred'
  resolution_category_display?: string
  customer_rating?: number
  customer_feedback?: string
  created_at: string
  updated_at: string
  assigned_at?: string
  acknowledged_at?: string
  resolved_at?: string
  closed_at?: string
  target_response_time?: string
  target_resolution_time?: string
  actual_response_time?: string
  photos_count: number
  comments_count: number
  is_overdue: boolean
  days_open: number
  can_be_rated: boolean
  // Detailed view fields
  photos?: ServiceRequestPhoto[]
  comments?: ServiceRequestComment[]
  timeline?: any
  related_asset_info?: any
}

// Service Request Comment Types
export interface ServiceRequestComment {
  id: number
  comment: string
  author_name: string
  author_type: string
  is_from_customer: boolean
  is_from_staff: boolean
  status_changed_from?: string
  status_changed_to?: string
  created_at: string
  updated_at: string
}

// Service Request Photo Types
export interface ServiceRequestPhoto {
  id: number
  photo: string
  photo_url: string
  caption?: string
  file_size?: number
  image_width?: number
  image_height?: number
  photo_location?: string
  uploaded_at: string
  uploader_name: string
  uploader_type: string
}

// Dashboard Data Types
export interface DashboardData {
  customer: Customer
  account_summary: {
    account_number: string
    service_address: string
    service_type: string
    connection_date?: string
    account_status: string
    meter_number?: string
  }
  recent_requests: ServiceRequest[]
  service_alerts: Array<{
    type: string
    message: string
    created_at: string
  }>
  quick_actions: Array<{
    title: string
    description: string
    icon: string
    url: string
    primary: boolean
  }>
  // Additional dashboard metrics
  usage_summary?: {
    current_month: number
    last_month: number
    average: number
  }
  billing_summary?: {
    current_bill?: number
    due_date?: string
    status: string
  }
}

// Authentication Tokens (matching Django JWT)
export interface AuthTokens {
  access_token: string // Django returns 'access'
  refresh_token: string // Django returns 'refresh'
  expires_in: number
  session_id?: string
}

// Tenant Information
export interface TenantInfo {
  name: string
  logo_url?: string
  primary_color: string
  contact_phone: string
  contact_email: string
  emergency_phone: string
  // Additional tenant fields from Django
  id?: number
  schema_name?: string
  is_active?: boolean
  domains?: Array<{
    domain: string
    is_primary: boolean
    is_active: boolean
  }>
}

// Form Types
export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  new_password: string
  new_password_confirm: string
}

export interface ChangePasswordData {
  current_password: string // Backend expects 'old_password'
  new_password: string
  new_password_confirm: string
}

// Connection Verification Types (for registration)
export interface ConnectionVerificationData {
  account_number?: string
  meter_number?: string
  last_name: string
  phone_number: string
}

export interface VerifiedConnection {
  account_number: string
  address: string
  meter_number?: string
  connection_date?: string
}

// Asset Types (from your distro module - might be useful for customer portal)
export interface Asset {
  id: number
  asset_id: string
  name: string
  asset_type: number
  asset_type_name: string
  location: string
  zone?: number
  zone_name?: string
  address?: string
  status: 'operational' | 'maintenance' | 'damaged' | 'decommissioned'
  condition: 1 | 2 | 3 | 4 | 5 // 1=Critical, 5=Excellent
  installation_date?: string
  last_inspection?: string
  next_inspection?: string
  specifications?: any
  notes?: string
  created_at: string
  updated_at: string
}

// User Types (for session management)
export interface User {
  id: number
  email: string
  employee_id?: string
  first_name: string
  last_name: string
  full_name: string
  phone_number?: string
  role: 'admin' | 'supervisor' | 'field_tech' | 'customer_service'
  avatar?: string
  location_tracking_consent: boolean
  last_active?: string
  is_active: boolean
  date_joined: string
}

// Session Types
export interface UserSession {
  session_id: string
  user_agent: string
  ip_address: string
  created_at: string
  last_activity: string
  is_current: boolean
}

// Error Types
export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: any
}

// Utility Types
export type IssueTypeColors = {
  [K in ServiceRequest['issue_type']]: string
}

export type StatusColors = {
  [K in ServiceRequest['status']]: string
}

export type UrgencyColors = {
  [K in ServiceRequest['urgency']]: string
}

// Pagination Types (matching Django DRF)
export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

// File Upload Types
export interface FileUpload {
  file: File
  caption?: string
  location?: string
}