'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  EyeOff, 
  Droplets, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useCustomerAuth, useTenantInfo } from '@/hooks'

interface LoginPageProps {
  params: { tenant: string }
}

export default function LoginPage({ params }: LoginPageProps) {
  const router = useRouter()
  const { login, loading, error, clearError, isAuthenticated } = useCustomerAuth()
  const tenantInfo = useTenantInfo()
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${params.tenant}`)
    }
  }, [isAuthenticated, router, params.tenant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    try {
      await login({
        username: formData.username,
        password: formData.password
      })
      // Navigation will be handled by the auth middleware
    } catch (err) {
      // Error is handled by the auth store
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="text-6xl mb-4">💧</div>
            <h1 className="text-4xl font-bold mb-2">
              {tenantInfo?.name || `${params.tenant.charAt(0).toUpperCase() + params.tenant.slice(1)} Water`}
            </h1>
            <h2 className="text-2xl font-semibold mb-4">Customer Portal</h2>
            <p className="text-xl text-blue-100">"Your water, your way"</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>99.8% Service Uptime</span>
            </div>
            <div className="flex items-center space-x-3">
              <Droplets className="w-5 h-5 text-blue-300" />
              <span>850K+ Connections</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-yellow-300" />
              <span>24/7 Customer Support</span>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-blue-100">
            <p>Need help? Call {tenantInfo?.contact_phone || '+254 20 445 2000'}</p>
          </div>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Portal</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Account Number / Email / Phone</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your account number"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  disabled={loading}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Separator />

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              New customer?{' '}
              <Link
                href={`/${params.tenant}/auth/register`}
                className="text-blue-600 hover:underline font-medium"
              >
                Register Account
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Forgot password?{' '}
              <Link
                href={`/${params.tenant}/auth/forgot-password`}
                className="text-blue-600 hover:underline font-medium"
              >
                Reset Password
              </Link>
            </p>
          </div>

          <div className="text-center text-sm text-gray-500">
            Need help? <Phone className="w-4 h-4 inline" /> {tenantInfo?.contact_phone || '+254 20 445 2000'}
          </div>
        </div>
      </div>
    </div>
  )
}