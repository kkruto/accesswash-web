'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Droplets, 
  CreditCard, 
  FileText, 
  Phone, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Bell,
  User,
  LogOut
} from 'lucide-react'
import { useCustomerAuth, useTenantInfo } from '@/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardPageProps {
  params: { tenant: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { customer, logout } = useCustomerAuth()
  const tenantInfo = useTenantInfo()
  
  // Mock dashboard data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    currentBill: {
      amount: 2850,
      dueDate: '2024-03-25',
      status: 'pending'
    },
    usage: {
      current: 127,
      average: 95,
      trend: 'up'
    },
    serviceStatus: {
      water: 'active',
      lastReading: '2024-03-10'
    },
    activeRequests: 1,
    notifications: [
      {
        id: 1,
        type: 'maintenance',
        title: 'Scheduled Maintenance',
        message: 'March 20, 8AM-12PM - Westlands area',
        date: '2024-03-15'
      }
    ]
  })

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">💧</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {tenantInfo?.name || `${params.tenant.charAt(0).toUpperCase() + params.tenant.slice(1)} Water`}
                </h1>
                <p className="text-sm text-gray-500">Customer Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{customer?.first_name}</span>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href={`/${params.tenant}/account`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {customer?.first_name}! 
            {new Date().getHours() < 12 ? ' 🌅' : new Date().getHours() < 18 ? ' ☀️' : ' 🌙'}
          </h2>
          <p className="text-gray-600">
            Account: {customer?.account_number} • {customer?.property_address}
          </p>
          
          <div className="mt-4 bg-white rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">Service Active</span>
              <span className="text-gray-500">•</span>
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">Water flowing normally</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              📊 Current reading: {dashboardData.usage.current} m³ • 📅 Last reading: {formatDate(dashboardData.serviceStatus.lastReading)}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href={`/${params.tenant}/billing`}>
              <CardContent className="p-6 text-center">
                <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Pay Bill</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(dashboardData.currentBill.amount)}
                </p>
                <p className="text-sm text-gray-600">Due: {formatDate(dashboardData.currentBill.dueDate, 'MMM dd')}</p>
                <Button size="sm" className="mt-3 w-full">Pay Now</Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href={`/${params.tenant}/service-requests/new`}>
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Report Problem</h3>
                <p className="text-sm text-gray-600 mb-3">Quick reporting</p>
                <Button size="sm" variant="outline" className="w-full">Report Issue</Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href={`/${params.tenant}/usage`}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Usage Monitor</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{dashboardData.usage.current} m³</p>
                <p className="text-sm text-gray-600">This month</p>
                <Button size="sm" variant="outline" className="mt-3 w-full">View Usage</Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href={`/${params.tenant}/service-requests`}>
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Service Requests</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{dashboardData.activeRequests}</p>
                <p className="text-sm text-gray-600">Active requests</p>
                <Button size="sm" variant="outline" className="mt-3 w-full">View Requests</Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Recent Bills</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium">March 2024</p>
                    <p className="text-sm text-gray-600">Due in 5 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(dashboardData.currentBill.amount)}</p>
                    <Badge variant="destructive" className="text-xs">Pending</Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">February 2024</p>
                    <p className="text-sm text-gray-600">Paid on time</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(2340)}</p>
                    <Badge variant="secondary" className="text-xs">Paid</Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">January 2024</p>
                    <p className="text-sm text-gray-600">Paid on time</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(2680)}</p>
                    <Badge variant="secondary" className="text-xs">Paid</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${params.tenant}/billing`}>View All Bills</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/${params.tenant}/billing/auto-pay`}>Setup Auto-pay</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Water Usage Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between space-x-2 mb-4">
                {/* Simple bar chart representation */}
                {[85, 92, 78, 95, 88, 127].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(value / 150) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">
                      {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][index]}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">This month:</span>
                  <span className="font-medium">{dashboardData.usage.current} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Household average:</span>
                  <span className="font-medium">{dashboardData.usage.average} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">vs. Last month:</span>
                  <span className="font-medium text-red-600">+29.6%</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link href={`/${params.tenant}/usage`}>View Detailed Usage</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Service Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Service Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">{notification.title}</h4>
                      <p className="text-sm text-blue-700">{notification.message}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Water Quality Report</h4>
                    <p className="text-sm text-green-700">February 2024: Excellent quality standards maintained</p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Updates
              </Button>
            </CardContent>
          </Card>

          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium capitalize">{customer?.service_type || 'Residential'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection Date:</span>
                  <span className="font-medium">{formatDate(customer?.created_at || '2020-01-01', 'MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meter Number:</span>
                  <span className="font-medium">{customer?.meter_number || 'M-WL-789456'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tariff:</span>
                  <span className="font-medium">Domestic Rate</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/${params.tenant}/account`}>View Full Account Details</Link>
                </Button>
                
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">Need help?</p>
                  <a 
                    href={`tel:${tenantInfo?.contact_phone || '+254 20 445 2000'}`}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    <Phone className="w-4 h-4 inline mr-1" />
                    Call support
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Last updated: 2 minutes ago</span>
            <span>Status: All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}