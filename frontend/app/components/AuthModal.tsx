'use client';

import { AuthService } from '@/app/lib/auth';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoData?: {
    productName: string;
    niche: string;
    targetAudience: string;
    generatedAd: any;
  };
  triggerSource?: 'demo_save' | 'try_again' | 'nav_signup' | 'login' | 'agency_plan_signup' | 'starter_plan_signup' | 'pro_plan_signup' | 'pricing_page';
}

export default function AuthModal({ isOpen, onClose, demoData, triggerSource = 'demo_save' }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  
  // Set default auth mode based on trigger source
  useEffect(() => {
    if (triggerSource === 'login') {
      setIsSignUp(false);
    } else {
      setIsSignUp(true);
    }
  }, [triggerSource]);

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailAuth = () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');
    
    // Store demo data to preserve it through auth flow
    if (demoData) {
      sessionStorage.setItem('pendingDemoData', JSON.stringify(demoData));
    }
    
    if (isSignUp) {
      AuthService.registerWithEmail(email, password)
        .then(() => {
          setIsLoading(false);
          onClose();
          
          // Redirect to dashboard or continue flow
          const pendingDemo = sessionStorage.getItem('pendingDemoData');
          if (pendingDemo) {
            sessionStorage.removeItem('pendingDemoData');
            window.location.href = '/generate?restored=true';
          } else {
            window.location.href = '/dashboard';
          }
        })
        .catch(error => {
          setIsLoading(false);
          setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
        });
    } else {
      AuthService.loginWithEmail(email, password)
        .then(() => {
          setIsLoading(false);
          onClose();
          
          // Redirect to dashboard or continue flow
          const pendingDemo = sessionStorage.getItem('pendingDemoData');
          if (pendingDemo) {
            sessionStorage.removeItem('pendingDemoData');
            window.location.href = '/generate?restored=true';
          } else {
            window.location.href = '/dashboard';
          }
        })
        .catch(error => {
          setIsLoading(false);
          setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-end sm:items-center justify-center p-4">
        <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-8 pt-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Get Started' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp ? 'Create an account to start building' : 'Sign in to continue creating'}
              </p>
            </div>

            {/* Demo Preview (if available) */}
            {demoData && triggerSource === 'demo_save' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Your Generated Ad:</h4>
                <p className="text-sm text-gray-600 italic">
                  "{demoData.generatedAd?.hook || 'Your amazing hook...'}"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  For: {demoData.productName} • {demoData.niche}
                </p>
              </div>
            )}

            {/* Auth Mode Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    !isSignUp
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    isSignUp
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Auth Forms */}
            {isSignUp ? (
              /* Email Auth Form for Sign Up */
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                      <button onClick={() => setError('')} className="text-red-700">
                        <span className="text-2xl">&times;</span>
                      </button>
                    </span>
                  </div>
                )}
                
                {/* Google Sign Up */}
                <button
                  onClick={() => {
                    setIsLoading(true);
                    
                    // Store demo data to preserve it through auth flow
                    if (demoData) {
                      sessionStorage.setItem('pendingDemoData', JSON.stringify(demoData));
                    }
                    
                    AuthService.initiateGoogleAuth();
                  }}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-3"></div>
                      Connecting...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailAuth();
                }}>
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                      type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            ) : (
              /* Sign In Options - Both Email and Google */
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                      <button onClick={() => setError('')} className="text-red-700">
                        <span className="text-2xl">&times;</span>
                      </button>
                    </span>
                  </div>
                )}
                
                {/* Google Sign In */}
                <button
                  onClick={() => {
                    setIsLoading(true);
                    
                    // Store demo data to preserve it through auth flow
                    if (demoData) {
                      sessionStorage.setItem('pendingDemoData', JSON.stringify(demoData));
                    }
                    
                    AuthService.initiateGoogleAuth();
                  }}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-3"></div>
                      Connecting...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                {/* Email Sign In */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailAuth();
                }}>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !email || !password}
                      className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          {isSignUp ? 'Creating Account...' : 'Signing In...'}
                        </div>
                      ) : (
                        isSignUp ? 'Create Account' : 'Sign In'
                      )}
                    </button>

                    {/* Forgot Password Link for Sign In */}
                    {!isSignUp && (
                      <div className="text-center">
                        <a
                          href="/auth/forgot-password"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Forgot your password?
                        </a>
                      </div>
                    )}
                  </div>
                </form>
                
                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Need an account? Sign up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}