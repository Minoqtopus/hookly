'use client';

import { modals } from '@/app/lib/copy';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, ApiClientError } from '@/app/lib/api';
import { useApp } from '@/app/lib/context';
import type { RegisterRequest, LoginRequest } from '@/app/lib/contracts';

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
  const router = useRouter();
  const { actions } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(triggerSource !== 'login');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async () => {
    if (!email || !password) return;
        
    setIsLoading(true);
    setError('');
    
    // Store demo data to preserve it through auth flow
    if (demoData) {
      sessionStorage.setItem('pendingDemoData', JSON.stringify(demoData));
    }
    
    try {
      if (isSignUp) {
        const registerData: RegisterRequest = { email, password };
        const response = await authAPI.register(registerData);
        
        // Store tokens in localStorage and cookies
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Set access token as cookie for middleware authentication
        document.cookie = `access_token=${response.access_token}; path=/; max-age=${15 * 60}; SameSite=Strict`; // 15 minutes
        
        // Update context with user data (extract from response or create mock data)
        const userData = response.user || {
          id: '1', // TODO: Get from JWT or API response
          email: email,
          plan: 'trial',
          trial_generations_used: 0,
          is_beta_user: false,
          email_verified: true,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        const userStatsData = {
          generationsUsed: 0,
          generationsThisMonth: 0,
          totalGenerations: 0,
          isTrialUser: true,
          monthlyLimit: 15,
          streak: 0,
          totalViews: 0,
          avgCTR: 0,
          generationsToday: 0,
          trialGenerationsUsed: 0,
        };
        
        // Update context state immediately
        actions.login(userData, userStatsData);
        
        // Success - close modal and redirect
        setIsLoading(false);
        onClose();
        
        // Redirect to dashboard or continue flow
        const pendingDemo = sessionStorage.getItem('pendingDemoData');
        if (pendingDemo) {
          sessionStorage.removeItem('pendingDemoData');
          router.push('/generate?restored=true');
        } else {
          router.push('/dashboard');
        }
      } else {
        const loginData: LoginRequest = { email, password };
        const response = await authAPI.login(loginData);
        
        // Store tokens in localStorage and cookies
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Set access token as cookie for middleware authentication
        document.cookie = `access_token=${response.access_token}; path=/; max-age=${15 * 60}; SameSite=Strict`; // 15 minutes
        
        // Update context with user data (extract from response or create mock data)
        const userData = response.user || {
          id: '1', // TODO: Get from JWT or API response
          email: email,
          plan: 'trial',
          trial_generations_used: 0,
          is_beta_user: false,
          email_verified: true,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        const userStatsData = {
          generationsUsed: 0,
          generationsThisMonth: 0,
          totalGenerations: 0,
          isTrialUser: true,
          monthlyLimit: 15,
          streak: 0,
          totalViews: 0,
          avgCTR: 0,
          generationsToday: 0,
          trialGenerationsUsed: 0,
        };
        
        // Update context state immediately
        actions.login(userData, userStatsData);
        
        // Success - close modal and redirect
        setIsLoading(false);
        onClose();
        
        // Redirect to dashboard or continue flow
        const pendingDemo = sessionStorage.getItem('pendingDemoData');
        if (pendingDemo) {
          sessionStorage.removeItem('pendingDemoData');
          router.push('/generate?restored=true');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error instanceof ApiClientError) {
        // Handle specific error types with user-friendly messages
        if (error.isValidationError) {
          const validationMessage = Array.isArray(error.apiError.message) 
            ? error.apiError.message.join(', ')
            : error.apiError.message;
          setError(validationMessage);
        } else if (error.isAuthError) {
          setError(isSignUp ? 'Registration failed. Please try again.' : 'Invalid email or password.');
        } else if (error.isConflictError) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.isRateLimitError) {
          setError('Too many attempts. Please wait a moment and try again.');
        } else {
          setError(error.toUserMessage());
        }
      } else {
        setError(modals.auth.errors.fallback);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 opacity-100">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-end sm:items-center justify-center p-4">
        <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto shadow-2xl transform transition-all duration-200 scale-100 translate-y-0">
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
                {isSignUp ? modals.auth.titles.signup : modals.auth.titles.login}
              </h2>
              <p className="text-gray-600">
                {isSignUp ? modals.auth.subtitles.signup : modals.auth.subtitles.login}
              </p>
            </div>

            {/* Demo Preview (if available) */}
            {demoData && triggerSource === 'demo_save' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{modals.auth.demo.title}</h4>
                <p className="text-sm text-gray-600 italic">
                  "{demoData.generatedAd?.hook || 'Your amazing hook...'}"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {modals.auth.demo.productPrefix} {demoData.productName} • {demoData.niche}
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
                  {modals.auth.tabs.signin}
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
                  {modals.auth.tabs.signup}
                </button>
              </div>
            </div>

            {/* Auth Forms */}
            {isSignUp ? (
              /* Email Auth Form for Sign Up */
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">{modals.auth.errors.title}</strong>
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
                    // Store demo data to preserve it through auth flow
                    if (demoData) {
                      sessionStorage.setItem('pendingDemoData', JSON.stringify(demoData));
                    }
                    
                    // Initiate Google OAuth flow
                    authAPI.initiateGoogleAuth();
                  }}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-3"></div>
                      {modals.auth.google.loading}
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {modals.auth.google.text}
                    </>
                  )}
                </button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">{modals.auth.divider}</span>
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
                    placeholder={modals.auth.form.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder={modals.auth.form.passwordPlaceholder}
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
                          {modals.auth.form.loading.signup}
                        </>
                      ) : (
                        <>{modals.auth.form.signupButton}</>
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
                    {modals.auth.links.switchToSignin}
                  </button>
                </div>
              </div>
            ) : (
              /* Sign In Options - Both Email and Google */
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">{modals.auth.errors.title}</strong>
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
                    // Store demo data to preserve it through auth flow
                    if (demoData) {
                      sessionStorage.setItem('pendingDemoData', JSON.stringify(demoData));
                    }
                    
                    // Initiate Google OAuth flow
                    authAPI.initiateGoogleAuth();
                  }}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-3"></div>
                      {modals.auth.google.loading}
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {modals.auth.google.text}
                    </>
                  )}
                </button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">{modals.auth.divider}</span>
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
                        placeholder={modals.auth.form.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder={modals.auth.form.passwordPlaceholder}
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
                          {isSignUp ? modals.auth.form.loading.signup : modals.auth.form.loading.signin}
                        </div>
                      ) : (
                        isSignUp ? modals.auth.form.signupButton : modals.auth.form.signinButton
                      )}
                    </button>

                    {/* Forgot Password Link for Sign In */}
                    {!isSignUp && (
                      <div className="text-center">
                        <a
                          href="/auth/forgot-password"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {modals.auth.links.forgotPassword}
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
                    {modals.auth.links.switchToSignup}
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