'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Eye, 
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useCustomerAuth } from '@/hooks'

interface ResetPasswordPageProps {
  params: { tenant: string }
}

interface PasswordStrength {
  score: number
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword, loading, error, clearError } = useCustomerAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  })

  // Get token from URL parameters
  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      // If no token, redirect to forgot password page
      router.push(`/${params.tenant}/auth/forgot-password`)
    }
  }, [searchParams, router, params.tenant])

  // Password strength checker
  useEffect(() => {
    const password = formData.newPassword
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    setPasswordStrength({ score, checks })
  }, [formData.newPassword])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (formData.newPassword !== formData.confirmPassword) {
      // This would be handled by form validation in real implementation
      return
    }
    
    if (passwordStrength.score < 3) {
      // This would be handled by form validation in real implementation
      return
    }
    
    try {
      await resetPassword(token, formData.newPassword, formData.confirmPassword)
      setSuccess(true)
    } catch (err) {
      // Error is handled by the auth store
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600 mb-4">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">What's next?</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Use your new password to sign in</li>
                    <li>• Consider enabling two-factor authentication</li>
                    <li>• Keep your password secure and don't share it</li>
                  </ul>
                </div>

                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Link href={`/${params.tenant}/auth/login`}>
                    Sign In to Your Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-600 mb-4">
              <AlertCircle className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Link href={`/${params.tenant}/auth/forgot-password`}>
                  Request New Reset Link
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
            <Lock className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert className="border-red-200 bg-red-50 mb-4">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
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
                
                {formData.newPassword && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Password Strength:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.score < 2 ? 'text-red-600' : 
                        passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.score < 2 ? 'Weak' : 
                         passwordStrength.score < 4 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.score < 2 ? 'bg-red-500' : 
                          passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.checks.length ? <CheckCircle className="w-3 h-3 mr-1" /> : <span className="w-3 h-3 mr-1">○</span>}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center ${passwordStrength.checks.uppercase && passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.checks.uppercase && passwordStrength.checks.lowercase ? <CheckCircle className="w-3 h-3 mr-1" /> : <span className="w-3 h-3 mr-1">○</span>}
                        Contains uppercase & lowercase
                      </div>
                      <div className={`flex items-center ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.checks.number ? <CheckCircle className="w-3 h-3 mr-1" /> : <span className="w-3 h-3 mr-1">○</span>}
                        Contains number
                      </div>
                      <div className={`flex items-center ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.checks.special ? <CheckCircle className="w-3 h-3 mr-1" /> : <span className="w-3 h-3 mr-1">○</span>}
                        Contains special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className={`mt-1 text-xs flex items-center ${
                    formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.newPassword === formData.confirmPassword ? 
                      <><CheckCircle className="w-3 h-3 mr-1" />Passwords match</> :
                      <><AlertCircle className="w-3 h-3 mr-1" />Passwords do not match</>
                    }
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword || passwordStrength.score < 3}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href={`/${params.tenant}/auth/login`}>
                  Back to Login
                </Link>
              </Button>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Security Tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use a unique password you haven't used before</li>
                <li>• Consider using a password manager</li>
                <li>• Don't share your password with anyone</li>
                <li>• Enable two-factor authentication for extra security</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}