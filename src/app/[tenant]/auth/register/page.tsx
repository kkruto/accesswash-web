'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Loader2
} from 'lucide-react'
import { useCustomerAuth, useTenantInfo } from '@/hooks'

interface RegisterPageProps {
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

export default function RegisterPage({ params }: RegisterPageProps) {
  const router = useRouter()
  const { register, loading, error, clearError, isAuthenticated } = useCustomerAuth()
  const { verifyConnection } = useCustomerAuth() // Add this to use connection verification
  const tenantInfo = useTenantInfo()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [verifiedConnection, setVerifiedConnection] = useState(null)
  const [verificationLoading, setVerificationLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // Step 1: Connection verification
    accountNumber: '',
    meterNumber: '',
    lastName: '',
    phoneNumber: '',
    
    // Step 2: Personal info
    firstName: '',
    email: '',
    preferredLanguage: 'en',
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: false,
    
    // Step 3: Security
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    
    // Step 4: Terms
    agreeTerms: false,
    agreePrivacy: false,
    agreeNotifications: false,
    agreePromotions: false
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${params.tenant}`)
    }
  }, [isAuthenticated, router, params.tenant])

  // Password strength checker
  useEffect(() => {
    const password = formData.password
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    setPasswordStrength({ score, checks })
  }, [formData.password])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
  }

  const handleConnectionVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerificationLoading(true)
    clearError()
    
    try {
      const result = await verifyConnection({
        account_number: formData.accountNumber,
        meter_number: formData.meterNumber,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber
      }, params.tenant)
      
      setVerifiedConnection(result)
      setCurrentStep(2)
    } catch (err: any) {
      // Error is already handled by the auth store
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleNextStep = () => {
    clearError()
    
    if (currentStep === 2) {
      if (!formData.firstName || !formData.email) {
        return
      }
    }
    
    if (currentStep === 3) {
      if (!formData.password || !formData.confirmPassword) {
        return
      }
      if (formData.password !== formData.confirmPassword) {
        return
      }
      if (passwordStrength.score < 3) {
        return
      }
    }
    
    setCurrentStep(prev => prev + 1)
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!formData.agreeTerms || !formData.agreePrivacy) {
      return
    }
    
    try {
      await register({
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        property_address: verifiedConnection?.address || '',
        account_number: formData.accountNumber,
        meter_number: formData.meterNumber,
        language: formData.preferredLanguage
      })
      // Navigation will be handled by auth middleware
    } catch (err) {
      // Error is handled by the auth store
    }
  }

  const renderProgressIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderBrandPanel = () => (
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
          <h3 className="text-lg font-semibold mb-4">Join thousands of satisfied customers</h3>
          <div className="space-y-2 text-sm">
            <div>✓ 24/7 online account access</div>
            <div>✓ Instant bill payments</div>
            <div>✓ Real-time service updates</div>
            <div>✓ Easy issue reporting</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex">
      {renderBrandPanel()}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          {renderProgressIndicator()}
          
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Step {currentStep} of 4</p>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Connection Verification */}
          {currentStep === 1 && (
            <form onSubmit={handleConnectionVerification} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Connection</h2>
                <p className="text-gray-600">Enter your details to find your water connection</p>
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="WS-2024-001234"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  disabled={verificationLoading}
                />
              </div>

              <div className="text-center text-gray-500">OR</div>

              <div>
                <Label htmlFor="meterNumber">Property/Meter Number</Label>
                <Input
                  id="meterNumber"
                  type="text"
                  placeholder="123456789"
                  value={formData.meterNumber}
                  onChange={(e) => handleInputChange('meterNumber', e.target.value)}
                  disabled={verificationLoading}
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name (as on bill)</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Kimani"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={verificationLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  disabled={verificationLoading}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Why do we need this?</h4>
                <p className="text-sm text-blue-700">
                  We verify your connection to ensure account security and prevent unauthorized access to your billing info.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link href={`/${params.tenant}/auth/login`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={verificationLoading || (!formData.accountNumber && !formData.meterNumber)}
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Connection
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Rest of the steps remain the same as in the previous component */}
          {/* ... (Steps 2, 3, and 4 implementation) ... */}

          {/* Back to login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={`/${params.tenant}/auth/login`}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}