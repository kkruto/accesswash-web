'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useCustomerAuth, useTenantInfo } from '@/hooks'

interface ForgotPasswordPageProps {
  params: { tenant: string }
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { forgotPassword, loading, error, clearError } = useCustomerAuth()
  const tenantInfo = useTenantInfo()
  
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      // Error is handled by the auth store
    }
  }

  const handleInputChange = (value: string) => {
    setEmail(value)
    if (error) clearError()
    if (success) setSuccess(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600 mb-4">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What's next?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check your email inbox (including spam folder)</li>
                    <li>• Click the reset link in the email</li>
                    <li>• Create a new password</li>
                    <li>• Sign in with your new password</li>
                  </ul>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email?{' '}
                    <button
                      onClick={() => setSuccess(false)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Try again
                    </button>
                  </p>
                  <p className="text-sm text-gray-600">
                    Need help?{' '}
                    <a
                      href={`tel:${tenantInfo?.contact_phone || '+254 20 445 2000'}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Contact support
                    </a>
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href={`/${params.tenant}/auth/login`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
              </div>
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
            <Mail className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use the email address associated with your account
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Instructions...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Instructions
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href={`/${params.tenant}/auth/login`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href={`/${params.tenant}/auth/register`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Need immediate help?</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>📞 Call: {tenantInfo?.contact_phone || '+254 20 445 2000'}</div>
                <div>✉️ Email: {tenantInfo?.contact_email || 'support@accesswash.org'}</div>
                <div>🕒 Available: 24/7 for emergencies</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}