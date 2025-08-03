import { create } from 'zustand'
import { createApiClient } from '@/lib/api-client'
import { Customer, LoginCredentials, RegisterData, TenantInfo } from '@/types'

interface AuthState {
  // State
  customer: Customer | null
  tenant: TenantInfo | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (credentials: LoginCredentials, tenant: string) => Promise<void>
  register: (data: RegisterData, tenant: string) => Promise<void>
  logout: (tenant: string) => Promise<void>
  forgotPassword: (email: string, tenant: string) => Promise<void>
  resetPassword: (token: string, newPassword: string, confirmPassword: string, tenant: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string, tenant: string) => Promise<void>
  loadCustomerFromStorage: (tenant: string) => void
  loadTenantInfo: (tenant: string) => Promise<void>
  updateProfile: (data: Partial<Customer>, tenant: string) => Promise<void>
  clearError: () => void
  checkAuthStatus: (tenant: string) => boolean
  // New method for connection verification
  verifyConnection: (data: any, tenant: string) => Promise<any>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  customer: null,
  tenant: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  // Login action
  login: async (credentials: LoginCredentials, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      const response = await api.login(credentials)
      
      if (response.success && response.data) {
        set({ 
          customer: response.data.customer, 
          isAuthenticated: true,
          loading: false,
          error: null
        })
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      set({ 
        error: error.message || 'Login failed', 
        loading: false,
        isAuthenticated: false,
        customer: null 
      })
      throw error
    }
  },

  // Register action
  register: async (data: RegisterData, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      const response = await api.register(data)
      
      if (response.success && response.data) {
        set({ 
          customer: response.data.customer, 
          isAuthenticated: true,
          loading: false,
          error: null
        })
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.message || 'Registration failed'
      set({ 
        error: errorMessage, 
        loading: false,
        isAuthenticated: false,
        customer: null 
      })
      throw error
    }
  },

  // Connection verification for registration
  verifyConnection: async (data: any, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      const response = await api.verifyConnection(data)
      set({ loading: false })
      return response.data
    } catch (error: any) {
      console.error('Connection verification error:', error)
      set({ 
        error: error.message || 'Connection verification failed', 
        loading: false 
      })
      throw error
    }
  },

  // Logout action
  logout: async (tenant: string) => {
    set({ loading: true })
    
    try {
      const api = createApiClient(tenant)
      await api.logout()
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
      set({ 
        customer: null, 
        isAuthenticated: false, 
        loading: false,
        error: null 
      })
    }
  },

  // Forgot password action
  forgotPassword: async (email: string, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      await api.forgotPassword(email)
      set({ loading: false })
    } catch (error: any) {
      console.error('Forgot password error:', error)
      const errorMessage = error.message || 'Failed to send reset instructions'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Reset password action
  resetPassword: async (token: string, newPassword: string, confirmPassword: string, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      await api.resetPassword({
        token,
        new_password: newPassword,
        new_password_confirm: confirmPassword
      })
      set({ loading: false })
    } catch (error: any) {
      console.error('Reset password error:', error)
      const errorMessage = error.message || 'Password reset failed'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Change password action
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword
      })
      set({ loading: false })
    } catch (error: any) {
      console.error('Change password error:', error)
      const errorMessage = error.message || 'Password change failed'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Load tenant information
  loadTenantInfo: async (tenant: string) => {
    try {
      const api = createApiClient(tenant)
      const tenantInfo = await api.getTenantInfo()
      set({ tenant: tenantInfo })
    } catch (error) {
      console.warn('Failed to load tenant info:', error)
      // Set default tenant info
      set({ 
        tenant: {
          name: tenant.charAt(0).toUpperCase() + tenant.slice(1) + ' Water',
          primary_color: '#4285F4',
          contact_phone: '+254 20 445 2000',
          contact_email: `info@${tenant}water.org`,
          emergency_phone: '+254 20 445 2000'
        }
      })
    }
  },

  // Load customer from storage
  loadCustomerFromStorage: (tenant: string) => {
    try {
      const api = createApiClient(tenant)
      const customer = api.getCurrentCustomer()
      const isAuthenticated = api.isAuthenticated()
      
      set({ 
        customer, 
        isAuthenticated,
        loading: false,
        error: null
      })
    } catch (error) {
      console.warn('Failed to load customer from storage:', error)
      set({ 
        customer: null, 
        isAuthenticated: false,
        loading: false,
        error: null
      })
    }
  },

  // Update profile
  updateProfile: async (data: Partial<Customer>, tenant: string) => {
    set({ loading: true, error: null })
    
    try {
      const api = createApiClient(tenant)
      const response = await api.updateProfile(data)
      
      if (response.success && response.data) {
        set({ 
          customer: response.data,
          loading: false,
          error: null
        })
      } else {
        throw new Error(response.message || 'Profile update failed')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      const errorMessage = error.message || 'Profile update failed'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Check auth status
  checkAuthStatus: (tenant: string): boolean => {
    try {
      const api = createApiClient(tenant)
      const isAuth = api.isAuthenticated()
      const customer = api.getCurrentCustomer()
      
      if (isAuth && customer) {
        set({ 
          customer, 
          isAuthenticated: true,
          loading: false,
          error: null
        })
        return true
      } else {
        set({ 
          customer: null, 
          isAuthenticated: false,
          loading: false,
          error: null
        })
        return false
      }
    } catch (error) {
      console.warn('Auth status check error:', error)
      set({ 
        customer: null, 
        isAuthenticated: false,
        loading: false,
        error: null
      })
      return false
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}))