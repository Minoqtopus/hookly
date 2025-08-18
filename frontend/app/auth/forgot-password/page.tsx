'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Always show success message for security (don't reveal if email exists)
      if (response.ok || response.status === 400) {
        setIsSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            If an account with <strong>{email}</strong> exists, we've sent you a password reset link.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  What to do next:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Check your inbox for a reset email</li>
                  <li>• Look in your spam folder too</li>
                  <li>• Click the link in the email within 1 hour</li>
                  <li>• Create a new password</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="btn-primary w-full"
            >
              Back to Sign In
            </button>
            
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="btn-secondary w-full"
            >
              Try Different Email
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or try again with a different email address.
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
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
              <button 
                onClick={() => setError('')} 
                className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Back to Sign In */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            🔒 <strong>Security Note:</strong> For your protection, we'll send the same message whether your email is in our system or not.
          </p>
        </div>
      </div>
    </div>
  );
}