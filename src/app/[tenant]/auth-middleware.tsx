'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCustomerAuth } from '@/hooks'

export default function AuthMiddleware({
  children,
  tenant,
}: {
  children: React.ReactNode
  tenant: string
}) {
  const { isAuthenticated, loading, checkAuthStatus } = useCustomerAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Check if we're on an auth page
  const isAuthPage = pathname.includes('/auth/')

  useEffect(() => {
    // Check auth status when component mounts
    const isAuth = checkAuthStatus()
    
    // Handle redirects after loading is complete
    if (!loading) {
      if (!isAuth && !isAuthPage) {
        // Not authenticated and not on auth page - redirect to login
        router.push(`/${tenant}/auth/login`)
      } else if (isAuth && isAuthPage) {
        // Authenticated but on auth page - redirect to dashboard
        router.push(`/${tenant}`)
      }
    }
  }, [tenant, loading, isAuthenticated, isAuthPage, router, checkAuthStatus])

  // Show loading spinner while checking auth
  if (loading && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}