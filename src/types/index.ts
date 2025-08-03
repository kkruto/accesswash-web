// API Response Types (matching Django backend)
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    errors?: Record<string, string[]>
  }
  
  // Authentication Types (matching Django portal models)
  export interface LoginCredentials {
    username: string // email or phone number
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
    account_number: string
    meter_number?: string
    property_address: string
    service_type: 'residential' | 'commercial' | 'industrial' | 'institutional'
    language: string
    email_verified: boolean
    phone_verified: boolean
    last_login?: string
    created_at: string
  }
  
  // Service Request Types (matching Django support models)
  export interface ServiceRequest {
    id: string
    request_number: string
    customer: string
    issue_type: 'no_water' | 'low_pressure' | 'pipe_burst' | 'water_quality' | 'meter_problem' | 'billing_inquiry' | 'connection_request' | 'disconnection' | 'other'
    title: string
    description: string
    urgency: 'emergency' | 'high' | 'standard' | 'low'
    status: 'open' | 'acknowledged' | 'assigned' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'cancelled'
    reported_location: string
    location_coordinates?: {
      type: 'Point'
      coordinates: [number, number]
    }
    assigned_to?: string
    resolution_notes?: string
    resolution_category?: string
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
    priority_score: number
  }
  
  // Service Request Comment Types
  export interface ServiceRequestComment {
    id: string
    service_request: string
    author_customer?: string
    author_staff?: string
    comment: string
    is_internal: boolean
    status_changed_from?: string
    status_changed_to?: string
    created_at: string
    updated_at: string
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
  }
  
  // Authentication Tokens
  export interface AuthTokens {
    access_token: string
    refresh_token: string
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
    current_password: string
    new_password: string
    new_password_confirm: string
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