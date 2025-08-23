'use client';

import { AuthModal } from '@/app/components/modals';
import { ScarcityIndicator } from '@/app/components/public';
import { landingPage } from '@/app/lib/copy';
import { CheckCircle, Play, Sparkles, Star, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTrigger, setAuthTrigger] = useState<'nav_signup' | 'login'>('nav_signup');
  const router = useRouter();

  const handleTryDemo = () => {
    // Navigate to dedicated demo page using client-side routing
    router.push('/demo');
  };

  return (
    <>
      {/* Hero Section - Mobile First */}
      <div className="relative overflow-hidden">
        <div className="pb-16">

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center bg-primary-50 rounded-full px-4 py-2 mb-4">
              <Star className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">
                {landingPage.socialProof.badge}
              </span>
            </div>

            {/* Scarcity Indicator */}
            <div className="flex justify-center mb-6">
              <ScarcityIndicator type="users_online" size="medium" />
            </div>


            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {landingPage.hero.title.prefix}{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {landingPage.hero.title.highlight}
              </span>
              <br />
              {landingPage.hero.title.suffix}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {landingPage.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={handleTryDemo}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
              >
                <Play className="h-5 w-5 mr-2" />
                {landingPage.hero.cta}
              </button>
              
              <button 
                onClick={() => {
                  setAuthTrigger('nav_signup');
                  setShowAuthModal(true);
                }}
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {landingPage.hero.secondaryCta}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              {landingPage.trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {indicator}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-secondary-100/20 transform skew-y-1"></div>
        </div>
      </div>

      {/* Social Proof Section - Full Width */}
      <div className="bg-white py-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {landingPage.socialProof.title}
            </h2>
            <p className="text-gray-600">
              {landingPage.socialProof.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { ...landingPage.socialProof.stats.views, icon: TrendingUp },
              { ...landingPage.socialProof.stats.revenue, icon: Star },
              { ...landingPage.socialProof.stats.users, icon: CheckCircle },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
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
    </>
  );
}