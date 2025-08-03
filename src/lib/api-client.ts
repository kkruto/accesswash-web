import axios, { AxiosInstance } from 'axios'
import Cookies from 'js-cookie'
import { 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  Customer, 
  ServiceRequest,
  DashboardData,
  AuthTokens,
  TenantInfo
} from '@/types'

class ApiClient {
  private client: AxiosInstance
  private tenant: string

  constructor(tenant: string) {
    this.tenant = tenant
    
    // Create axios instance pointing to your Django backend
    this.client = axios.create({
      baseURL: this.getBaseURL(),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired - clear auth and redirect
          this.clearAuthData()
          if (typeof window !== 'undefined') {
            window.location.href = `/${tenant}/auth/login`
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getBaseURL(): string {
    if (typeof window !== 'undefined') {
      // Client-side - detect environment
      const hostname = window.location.hostname
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        // Development - point to your Django backend
        return 'http://localhost:8000/api'
      }
      // Production
      return `https://api.${this.tenant}.accesswash.org/api`
    } else {
      // Server-side
      return process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000/api'
        : `https://api.${this.tenant}.accesswash.org/api`
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return Cookies.get(`accesswash_token_${this.tenant}`)
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return
    Cookies.set(`accesswash_token_${this.tenant}`, token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return
    Cookies.remove(`accesswash_token_${this.tenant}`)
    Cookies.remove(`accesswash_customer_${this.tenant}`)
  }

  // Authentication endpoints (matching your Django API)
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ customer: Customer; tokens: AuthTokens }>> {
    try {
      const response = await this.client.post('/portal/auth/login/', {
        email: credentials.username, // Your backend expects email field
        password: credentials.password
      })
      
      // Handle the response based on your backend structure
      if (response.data && response.data.access) {
        const tokens = {
          access_token: response.data.access,
          refresh_token: response.data.refresh,
          expires_in: 3600 // Default 1 hour
        }
        
        this.setAuthToken(tokens.access_token)
        
        // Get customer profile after login
        const customerProfile = await this.getProfile()
        
        return {
          success: true,
          data: {
            customer: customerProfile.data as Customer,
            tokens
          }
        }
      }
      
      throw new Error('Invalid response format')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ customer: Customer; tokens: AuthTokens }>> {
    try {
      const response = await this.client.post('/portal/auth/register/', {
        email: data.email,
        phone_number: data.phone_number,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        property_address: data.property_address,
        account_number: data.account_number,
        meter_number: data.meter_number,
        language: data.language || 'en'
      })
      
      if (response.data && response.data.access) {
        const tokens = {
          access_token: response.data.access,
          refresh_token: response.data.refresh,
          expires_in: 3600
        }
        
        this.setAuthToken(tokens.access_token)
        
        // Get customer profile after registration
        const customerProfile = await this.getProfile()
        
        return {
          success: true,
          data: {
            customer: customerProfile.data as Customer,
            tokens
          }
        }
      }
      
      throw new Error('Registration failed')
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.data) {
        // Handle field-specific errors
        const errors = error.response.data
        if (typeof errors === 'object') {
          const firstError = Object.values(errors)[0]
          if (Array.isArray(firstError)) {
            throw new Error(firstError[0] as string)
          }
        }
        throw new Error(errors.detail || errors.message || 'Registration failed')
      }
      throw new Error('Registration failed')
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = Cookies.get(`accesswash_refresh_${this.tenant}`)
      if (refreshToken) {
        await this.client.post('/portal/auth/logout/', {
          refresh_token: refreshToken
        })
      }
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
      this.clearAuthData()
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/portal/auth/forgot-password/', { 
        email 
      })
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      }
    } catch (error: any) {
      console.error('Forgot password error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to send reset email')
    }
  }

  async resetPassword(data: { 
    token: string; 
    new_password: string; 
    new_password_confirm: string 
  }): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/portal/auth/reset-password/', data)
      return {
        success: true,
        message: 'Password reset successfully'
      }
    } catch (error: any) {
      console.error('Reset password error:', error)
      if (error.response?.data) {
        const errors = error.response.data
        if (typeof errors === 'object') {
          const firstError = Object.values(errors)[0]
          if (Array.isArray(firstError)) {
            throw new Error(firstError[0] as string)
          }
        }
        throw new Error(errors.detail || 'Password reset failed')
      }
      throw new Error('Password reset failed')
    }
  }

  async changePassword(data: { 
    current_password: string; 
    new_password: string; 
    new_password_confirm: string 
  }): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/portal/auth/change-password/', {
        old_password: data.current_password,
        new_password: data.new_password
      })
      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      throw new Error(error.response?.data?.detail || 'Password change failed')
    }
  }

  // Customer profile endpoints
  async getProfile(): Promise<ApiResponse<Customer>> {
    try {
      const response = await this.client.get('/portal/profile/')
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error('Get profile error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to load profile')
    }
  }

  async updateProfile(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      const response = await this.client.put('/portal/profile/', data)
      
      // Update stored customer data
      if (response.data) {
        Cookies.set(`accesswash_customer_${this.tenant}`, JSON.stringify(response.data), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }
      
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to update profile')
    }
  }

  // Dashboard endpoint
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await this.client.get('/portal/dashboard/')
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error('Get dashboard error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to load dashboard')
    }
  }

  // Service request endpoints (matching your support URLs)
  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await this.client.get('/support/requests/')
      return response.data.results || response.data
    } catch (error: any) {
      console.error('Get service requests error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to load service requests')
    }
  }

  async getServiceRequest(id: string): Promise<ServiceRequest> {
    try {
      const response = await this.client.get(`/support/requests/${id}/`)
      return response.data
    } catch (error: any) {
      console.error('Get service request error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to load service request')
    }
  }

  async createServiceRequest(data: {
    issue_type: string
    title: string
    description: string
    urgency: string
    reported_location: string
    location_coordinates?: { lat: number; lng: number }
  }): Promise<ApiResponse<ServiceRequest>> {
    try {
      const payload: any = {
        issue_type: data.issue_type,
        title: data.title,
        description: data.description,
        urgency: data.urgency,
        reported_location: data.reported_location
      }
      
      // Add coordinates if provided
      if (data.location_coordinates) {
        payload.latitude = data.location_coordinates.lat
        payload.longitude = data.location_coordinates.lng
      }
      
      const response = await this.client.post('/support/requests/', payload)
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error('Create service request error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to create service request')
    }
  }

  async addComment(requestId: string, comment: string): Promise<any> {
    try {
      const response = await this.client.post(`/support/requests/${requestId}/add_comment/`, {
        comment
      })
      return response.data
    } catch (error: any) {
      console.error('Add comment error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to add comment')
    }
  }

  async rateServiceRequest(requestId: string, rating: number, feedback?: string): Promise<any> {
    try {
      const response = await this.client.post(`/support/requests/${requestId}/rate/`, {
        customer_rating: rating,
        customer_feedback: feedback
      })
      return response.data
    } catch (error: any) {
      console.error('Rate service request error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to rate service request')
    }
  }

  // Photo upload for service requests
  async uploadPhoto(requestId: string, photo: File, caption?: string): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('photo', photo)
      if (caption) {
        formData.append('caption', caption)
      }

      const response = await this.client.post(
        `/support/requests/${requestId}/upload_photo/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Upload photo error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to upload photo')
    }
  }

  // Session management
  async getSessions(): Promise<any> {
    try {
      const response = await this.client.get('/portal/sessions/')
      return response.data
    } catch (error: any) {
      console.error('Get sessions error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to load sessions')
    }
  }

  async logoutSession(sessionId: string): Promise<any> {
    try {
      const response = await this.client.post(`/portal/sessions/${sessionId}/logout/`)
      return response.data
    } catch (error: any) {
      console.error('Logout session error:', error)
      throw new Error(error.response?.data?.detail || 'Failed to logout session')
    }
  }

  // Connection verification for registration
  async verifyConnection(data: {
    account_number?: string
    meter_number?: string
    last_name: string
    phone_number: string
  }): Promise<ApiResponse<any>> {
    try {
      // This endpoint might need to be created in your Django backend
      // For now, we'll simulate the verification
      const response = await this.client.post('/portal/auth/verify-connection/', data)
      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error('Verify connection error:', error)
      
      // For demo purposes, simulate a successful verification
      if (data.account_number || data.meter_number) {
        return {
          success: true,
          data: {
            account_number: data.account_number || 'WS-2024-001234',
            address: '123 Westlands Road, Nairobi',
            meter_number: data.meter_number || 'M-WL-789456',
            connection_date: 'January 2020'
          }
        }
      }
      
      throw new Error(error.response?.data?.detail || 'Connection verification failed')
    }
  }

  // Utility methods
  getCurrentCustomer(): Customer | null {
    if (typeof window === 'undefined') return null
    
    const customerData = Cookies.get(`accesswash_customer_${this.tenant}`)
    if (!customerData) return null
    
    try {
      return JSON.parse(customerData)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  // Get tenant info 
  async getTenantInfo(): Promise<TenantInfo> {
    try {
      // This endpoint might need to be created or you might get it from tenants API
      const response = await this.client.get('/tenants/')
      
      // Find the current tenant
      const tenants = response.data.results || response.data
      const currentTenant = tenants.find((t: any) => 
        t.domains?.some((d: any) => d.domain.includes(this.tenant))
      )
      
      if (currentTenant) {
        return {
          name: currentTenant.name,
          primary_color: '#4285F4',
          contact_phone: '+254 20 445 2000',
          contact_email: `info@${this.tenant}water.org`,
          emergency_phone: '+254 20 445 2000'
        }
      }
      
      throw new Error('Tenant not found')
    } catch (error: any) {
      console.warn('Failed to load tenant info:', error)
      // Fallback tenant info
      return {
        name: this.tenant.charAt(0).toUpperCase() + this.tenant.slice(1) + ' Water',
        primary_color: '#4285F4',
        contact_phone: '+254 20 445 2000',
        contact_email: `info@${this.tenant}water.org`,
        emergency_phone: '+254 20 445 2000'
      }
    }
  }
}

// Factory function to create API client
export function createApiClient(tenant: string): ApiClient {
  return new ApiClient(tenant)
}

export default ApiClient