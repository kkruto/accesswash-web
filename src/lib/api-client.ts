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
      timeout: 10000,
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
        return `http://${this.tenant}.accesswash.org:8000/api`
      }
      // Production
      return `https://${this.tenant}.accesswash.org/api`
    } else {
      // Server-side
      return process.env.NODE_ENV === 'development' 
        ? `http://${this.tenant}.accesswash.org:8000/api`
        : `https://${this.tenant}.accesswash.org/api`
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

  // Authentication endpoints (matching your Django URLs)
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ customer: Customer; tokens: AuthTokens }>> {
    try {
      const response = await this.client.post('/portal/auth/login/', credentials)
      
      if (response.data.success && response.data.tokens) {
        this.setAuthToken(response.data.tokens.access_token)
        
        // Store customer data
        Cookies.set(`accesswash_customer_${this.tenant}`, JSON.stringify(response.data.customer), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ customer: Customer; tokens: AuthTokens }>> {
    try {
      const response = await this.client.post('/portal/auth/register/', data)
      
      if (response.data.success && response.data.tokens) {
        this.setAuthToken(response.data.tokens.access_token)
        
        // Store customer data
        Cookies.set(`accesswash_customer_${this.tenant}`, JSON.stringify(response.data.customer), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/portal/auth/logout/')
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearAuthData()
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/portal/auth/forgot-password/', { email })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email')
    }
  }

  async resetPassword(data: { token: string; new_password: string; new_password_confirm: string }): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/portal/auth/reset-password/', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  }

  async changePassword(data: { current_password: string; new_password: string; new_password_confirm: string }): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/portal/auth/change-password/', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  }

  // Dashboard endpoint
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await this.client.get('/portal/dashboard/')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load dashboard')
    }
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<Customer>> {
    try {
      const response = await this.client.get('/portal/profile/')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load profile')
    }
  }

  async updateProfile(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      const response = await this.client.put('/portal/profile/', data)
      
      // Update stored customer data
      if (response.data.success) {
        Cookies.set(`accesswash_customer_${this.tenant}`, JSON.stringify(response.data.data), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  // Service request endpoints (matching your support URLs)
  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await this.client.get('/support/requests/')
      return response.data.results || response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load service requests')
    }
  }

  async getServiceRequest(id: string): Promise<ServiceRequest> {
    try {
      const response = await this.client.get(`/support/requests/${id}/`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load service request')
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
      const payload = {
        ...data,
        location_coordinates: data.location_coordinates ? {
          type: 'Point',
          coordinates: [data.location_coordinates.lng, data.location_coordinates.lat]
        } : undefined
      }
      
      const response = await this.client.post('/support/requests/', payload)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create service request')
    }
  }

  async addComment(requestId: string, comment: string): Promise<any> {
    try {
      const response = await this.client.post(`/support/requests/${requestId}/comments/`, {
        comment
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add comment')
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
    return !!this.getAuthToken() && !!this.getCurrentCustomer()
  }

  // Get tenant info (you might want to add this endpoint to Django)
  async getTenantInfo(): Promise<TenantInfo> {
    try {
      const response = await this.client.get('/core/tenant-info/')
      return response.data
    } catch (error: any) {
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