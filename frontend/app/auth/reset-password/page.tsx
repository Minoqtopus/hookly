'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordPageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  // Password strength checker
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength('weak');
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) setPasswordStrength('weak');
    else if (score < 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        if (data.message?.includes('expired')) {
          setError('This reset link has expired. Please request a new password reset.');
        } else if (data.message?.includes('invalid')) {
          setError('This reset link is invalid. Please request a new password reset.');
        } else {
          setError(data.message || 'Failed to reset password. Please try again.');
        }
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What's next:</h3>
            <ul className="text-sm text-gray-700 space-y-1 text-left">
              <li>✅ Your account is secure</li>
              <li>✅ Sign in with your new password</li>
              <li>✅ Consider enabling 2FA in settings</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="btn-primary w-full"
            >
              Sign In Now
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            🔒 For security, we've automatically signed you out of all devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h2>
          <p className="text-gray-600">
            Choose a strong password to secure your account.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            </div>
            <button 
              onClick={() => setError('')} 
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

        {/* Token Error State */}
        {!token ? (
          <div className="text-center">
            <div className="mb-6">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-600">
                This password reset link is invalid or missing. Please request a new one.
              </p>
            </div>
            <Link href="/auth/forgot-password" className="btn-primary w-full block text-center">
              Request New Reset Link
            </Link>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength === 'weak' ? 'Weak' :
                       passwordStrength === 'medium' ? 'Medium' :
                       'Strong'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use 8+ characters with letters, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {password === confirmPassword ? (
                    <p className="text-xs text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Updating Password...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}

        {/* Security Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Password Tips:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use at least 8 characters</li>
            <li>• Include uppercase and lowercase letters</li>
            <li>• Add numbers and special characters</li>
            <li>• Avoid common words or personal info</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}