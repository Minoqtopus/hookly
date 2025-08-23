'use client';

import { useAuth } from '@/app/lib/context/AppContext';
import { getTrialLimit } from '@/app/lib/plans';
import { routeConfigs, useRouteGuard } from '@/app/lib/useRouteGuard';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  ExternalLink,
  Shield,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const { user } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Apply route guard - redirect unauthenticated users to homepage
  useRouteGuard(routeConfigs.settings);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="mt-8 lg:mt-0 lg:col-span-9">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{user.email}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_verified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                      <div className="flex items-center">
                        {(user.plan === 'starter' || user.plan === 'pro' || user.plan === 'agency') ? (
                          <>
                            <Crown className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-gray-900 font-medium">Pro Member</span>
                          </>
                        ) : (
                          <span className="text-gray-900">Free Member</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Method</label>
                      <span className="text-gray-900 capitalize">{user.auth_provider}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
                  
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Export Account Data</div>
                          <div className="text-sm text-gray-600">Download all your generated ads and data</div>
                        </div>
                        <Download className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                    
                    <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Delete Account</div>
                          <div className="text-sm">Permanently delete your account and all data</div>
                        </div>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {(user.plan === 'starter' || user.plan === 'pro' || user.plan === 'agency') ? (
                        <>
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                            <Crown className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">Pro Plan</div>
                            <div className="text-gray-600">200+ generations per month, advanced features</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">Trial Plan</div>
                            <div className="text-gray-600">{getTrialLimit()} generations over 7 days, basic features</div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {user.plan === 'trial' ? (
                      <Link 
                        href="/upgrade?source=settings"
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Upgrade to Pro
                      </Link>
                    ) : (
                      <Link 
                        href="/upgrade/cancel"
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel Subscription
                      </Link>
                    )}
                  </div>

                  {(user.plan === 'starter' || user.plan === 'pro' || user.plan === 'agency') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <div className="font-medium text-yellow-800">Next Billing Date</div>
                          <div className="text-sm text-yellow-700">January 15, 2024 - $19.00</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {user.plan === 'trial' && (
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade to Pro</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {[
                        '200 ad generations per month',
                        'Advanced performance analytics',
                        'Batch generation (10+ ads)',
                        'No watermarks',
                        'Priority customer support',
                        'Custom templates & themes'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link 
                      href="/upgrade?source=settings"
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                    >
                      Start Free Trial
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
                  
                  {(user.plan === 'starter' || user.plan === 'pro' || user.plan === 'agency') ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                            <div className="text-sm text-gray-600">Expires 12/25</div>
                          </div>
                        </div>
                        <button className="text-primary-600 hover:text-primary-700 font-medium">
                          Update
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">Monthly Subscription</div>
                            <div className="text-sm text-gray-600">$19.00 per month</div>
                          </div>
                        </div>
                        <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                          Manage
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-900 font-medium mb-2">No billing information</div>
                      <div className="text-gray-600 mb-4">You're currently on the free plan</div>
                      <Link 
                        href="/upgrade?source=settings"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Upgrade to add billing →
                      </Link>
                    </div>
                  )}
                </div>

                {(user.plan === 'starter' || user.plan === 'pro' || user.plan === 'agency') && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h2>
                    
                    <div className="space-y-3">
                      {[
                        { date: 'Dec 15, 2023', amount: '$19.00', status: 'Paid' },
                        { date: 'Nov 15, 2023', amount: '$19.00', status: 'Paid' },
                        { date: 'Oct 15, 2023', amount: '$19.00', status: 'Paid' }
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900">{invoice.date}</div>
                              <div className="text-sm text-gray-600">Pro Plan Subscription</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">{invoice.amount}</span>
                            <span className="text-green-600 text-sm">{invoice.status}</span>
                            <button className="text-primary-600 hover:text-primary-700 text-sm">
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
                
                <div className="space-y-4">
                  {[
                    { id: 'marketing', label: 'Marketing emails', description: 'Product updates, tips, and special offers' },
                    { id: 'account', label: 'Account notifications', description: 'Login alerts and security notifications' },
                    { id: 'billing', label: 'Billing notifications', description: 'Payment confirmations and billing alerts' },
                    { id: 'product', label: 'Product updates', description: 'New features and improvements' }
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{notification.label}</div>
                        <div className="text-sm text-gray-600">{notification.description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Analytics Collection</div>
                        <div className="text-sm text-gray-600">Help us improve by sharing usage analytics</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Public Profile</div>
                        <div className="text-sm text-gray-600">Show your generated ads in community gallery</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
                  
                  <div className="space-y-3">
                    <Link 
                      href="/privacy"
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">Privacy Policy</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </Link>
                    
                    <Link 
                      href="/terms"
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">Terms of Service</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}