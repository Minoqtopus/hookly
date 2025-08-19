'use client';

import AuthModal from '@/app/components/AuthModal';
import ScarcityIndicator from '@/app/components/ScarcityIndicator';
import { useAuth } from '@/app/lib/AppContext';
import { routeConfigs, useRouteGuard } from '@/app/lib/useRouteGuard';
import { useSignupAvailability } from '@/app/lib/useSignupAvailability';
import { AlertCircle, ArrowRight, CheckCircle, Play, Sparkles, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTrigger, setAuthTrigger] = useState<'nav_signup' | 'login'>('nav_signup');
  const { availability, loading } = useSignupAvailability();
  
  // Apply route guard - redirect authenticated users to dashboard
  useRouteGuard(routeConfigs.landing);

  const handleTryDemo = () => {
    // Navigate to dedicated demo page
    window.location.href = '/demo';
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section - Mobile First */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Hookly</span>
            </div>
            <div className="hidden sm:flex items-center space-x-6">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </Link>
              <button 
                onClick={() => {
                  setAuthTrigger('login');
                  setShowAuthModal(true);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </button>
              {availability && !loading ? (
                availability.canSignup ? (
                  <button 
                    onClick={() => {
                      setAuthTrigger('nav_signup');
                      setShowAuthModal(true);
                    }}
                    className="btn-primary text-sm px-6 py-2"
                  >
                    {availability.remainingSignups <= 10 
                      ? `${availability.remainingSignups} Spots Left` 
                      : 'Start Free Trial'
                    }
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setAuthTrigger('nav_signup');
                      setShowAuthModal(true);
                    }}
                    className="btn-secondary text-sm px-6 py-2 opacity-75 cursor-not-allowed"
                    disabled
                  >
                    Join Waitlist
                  </button>
                )
              ) : (
                <button className="btn-primary text-sm px-6 py-2" disabled>
                  Loading...
                </button>
              )}
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center bg-primary-50 rounded-full px-4 py-2 mb-4">
              <Star className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">
                Trusted by 10,000+ creators & marketers • 4.9/5 rating
              </span>
            </div>

            {/* Scarcity Indicator */}
            <div className="flex justify-center mb-6">
              <ScarcityIndicator type="users_online" size="medium" />
            </div>

            {/* Signup Availability Alert */}
            {availability && !loading && (
              <div className="mb-6">
                {!availability.canSignup ? (
                  <div className="inline-flex items-center bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-amber-700">
                      {availability.signupMessage || 'Signups temporarily limited. Join our waitlist!'}
                    </span>
                  </div>
                ) : availability.remainingSignups <= 10 ? (
                  <div className="inline-flex items-center bg-red-50 border border-red-200 rounded-full px-4 py-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-700">
                      Only {availability.remainingSignups} spots left! Join now before we close signups.
                    </span>
                  </div>
                ) : availability.remainingSignups <= 25 ? (
                  <div className="inline-flex items-center bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-700">
                      {availability.remainingSignups} spots remaining. Don't miss out!
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Viral TikTok Ads
              </span>
              <br />
              in 30 Seconds
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI-powered UGC ad scripts, hooks, and visual prompts that actually convert. 
              No marketing experience needed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={handleTryDemo}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Demo Now
              </button>
              
              {availability && !loading && (
                availability.canSignup ? (
                  <button 
                    onClick={() => {
                      setAuthTrigger('nav_signup');
                      setShowAuthModal(true);
                    }}
                    className="btn-secondary text-lg px-8 py-4 flex items-center justify-center"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {availability.remainingSignups <= 10 
                      ? `Join Now (${availability.remainingSignups} left)` 
                      : 'Start Free Trial'
                    }
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setAuthTrigger('nav_signup');
                      setShowAuthModal(true);
                    }}
                    className="btn-secondary text-lg px-8 py-4 flex items-center justify-center opacity-75 cursor-not-allowed"
                    disabled
                  >
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Join Waitlist
                  </button>
                )
              )}
              
              <Link href="/examples" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
                Browse Templates
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
No signup required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Results in 30 seconds
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Mobile optimized
              </div>
            </div>
          </div>
        </div>

        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-secondary-100/20 transform skew-y-1"></div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Top Creators & Marketers
            </h2>
            <p className="text-gray-600">
              Join thousands who've generated millions in ad revenue
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { metric: "50M+", label: "Views Generated", icon: TrendingUp },
              { metric: "$2.3M", label: "Revenue Created", icon: Star },
              { metric: "10,000+", label: "Happy Users", icon: CheckCircle },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.metric}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource={authTrigger}
      />
    </div>
  );
}