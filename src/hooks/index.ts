import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createApiClient } from '@/lib/api-client'
import { extractTenant } from '@/lib/utils'

// Hook to get current tenant from URL
export function useTenant() {
  const params = useParams()
  const pathname = usePathname()
  
  // Extract tenant from URL parameters or pathname
  const tenant = typeof params?.tenant === 'string' 
    ? params.tenant 
    : extractTenant(undefined, pathname)
  
  return { 
    tenant,
    api: createApiClient(tenant)
  }
}

// Hook for customer authentication with tenant awareness
export function useCustomerAuth() {
  const { tenant } = useTenant()
  const {
    customer,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    loadCustomerFromStorage,
    loadTenantInfo,
    updateProfile,
    clearError,
    checkAuthStatus,
    verifyConnection // Added for connection verification
  } = useAuthStore()

  // Load customer from storage and tenant info on mount
  useEffect(() => {
    if (tenant) {
      loadCustomerFromStorage(tenant)
      loadTenantInfo(tenant)
    }
  }, [tenant, loadCustomerFromStorage, loadTenantInfo])

  return {
    customer,
    loading,
    error,
    isAuthenticated,
    
    // Wrapped actions with tenant
    login: (credentials: any) => login(credentials, tenant),
    register: (data: any) => register(data, tenant),
    logout: () => logout(tenant),
    forgotPassword: (email: string) => forgotPassword(email, tenant),
    resetPassword: (token: string, newPassword: string, confirmPassword: string) => 
      resetPassword(token, newPassword, confirmPassword, tenant),
    changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
      changePassword(currentPassword, newPassword, confirmPassword, tenant),
    updateProfile: (data: any) => updateProfile(data, tenant),
    loadCustomerFromStorage: () => loadCustomerFromStorage(tenant),
    checkAuthStatus: () => checkAuthStatus(tenant),
    verifyConnection: (data: any) => verifyConnection(data, tenant), // Added connection verification
    clearError,
  }
}

// Hook for tenant information
export function useTenantInfo() {
  const { tenant: tenantSlug } = useTenant()
  const { tenant: tenantInfo, loadTenantInfo } = useAuthStore()

  useEffect(() => {
    if (tenantSlug && !tenantInfo) {
      loadTenantInfo(tenantSlug)
    }
  }, [tenantSlug, tenantInfo, loadTenantInfo])

  return tenantInfo
}

// Hook for service requests management
export function useServiceRequests() {
  const { tenant, api } = useTenant()
  const { customer, isAuthenticated } = useCustomerAuth()

  const getServiceRequests = async () => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.getServiceRequests()
  }

  const getServiceRequest = async (id: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.getServiceRequest(id)
  }

  const createServiceRequest = async (data: {
    issue_type: string
    title: string
    description: string
    urgency: string
    reported_location: string
    location_coordinates?: { lat: number; lng: number }
  }) => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.createServiceRequest(data)
  }

  const addComment = async (requestId: string, comment: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.addComment(requestId, comment)
  }

  const rateServiceRequest = async (requestId: string, rating: number, feedback?: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.rateServiceRequest(requestId, rating, feedback)
  }

  const uploadPhoto = async (requestId: string, photo: File, caption?: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.uploadPhoto(requestId, photo, caption)
  }

  return {
    getServiceRequests,
    getServiceRequest,
    createServiceRequest,
    addComment,
    rateServiceRequest,
    uploadPhoto,
    customer,
    isAuthenticated
  }
}

// Hook for dashboard data
export function useDashboard() {
  const { api } = useTenant()
  const { isAuthenticated } = useCustomerAuth()

  const getDashboard = async () => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.getDashboard()
  }

  return {
    getDashboard,
    isAuthenticated
  }
}

// Hook for session management
export function useSessions() {
  const { api } = useTenant()
  const { isAuthenticated } = useCustomerAuth()

  const getSessions = async () => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.getSessions()
  }

  const logoutSession = async (sessionId: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated')
    return await api.logoutSession(sessionId)
  }

  return {
    getSessions,
    logoutSession,
    isAuthenticated
  }
}