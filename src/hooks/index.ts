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
    checkAuthStatus
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