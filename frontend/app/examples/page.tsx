'use client';

import AuthModal from '@/app/components/AuthModal';
import ScarcityIndicator from '@/app/components/ScarcityIndicator';
import TemplateLibrary from '@/app/components/TemplateLibrary';
import UpgradeModal from '@/app/components/UpgradeModal';
import { useAuth } from '@/app/lib/AppContext';
import { routeConfigs, useRouteGuard } from '@/app/lib/useRouteGuard';
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  PlayCircle,
  Sparkles,
  Star,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ExamplesPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [authTrigger, setAuthTrigger] = useState<'demo_save' | 'try_again' | 'nav_signup' | 'login'>('nav_signup');
  const router = useRouter();
  
  const { user, isAuthenticated } = useAuth();

  // Apply route guard - redirect authenticated users to dashboard
  useRouteGuard(routeConfigs.examples);

  const handleUseTemplate = (template: any) => {
    if (!isAuthenticated) {
      // Store template data and trigger auth
      sessionStorage.setItem('selectedTemplate', JSON.stringify({
        productName: template.title,
        niche: template.niche,
        targetAudience: template.targetAudience,
      }));
      setShowAuthModal(true);
      return;
    }

    // Store template data and navigate to generate page
    sessionStorage.setItem('selectedTemplate', JSON.stringify({
      productName: template.title,
      niche: template.niche,
      targetAudience: template.targetAudience,
    }));
    router.push('/generate');
  };

  const handleStartCreating = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    router.push('/generate');
  };

  const stats = [
    { metric: "2.3M+", label: "Total Views Generated", icon: TrendingUp },
    { metric: "157K", label: "Ads Created", icon: Sparkles },
    { metric: "4.8/5", label: "Average Performance", icon: Star },
  ];

  const filters = [
    { id: 'all', label: 'All Industries', count: 12 },
    { id: 'beauty', label: 'Beauty & Skincare', count: 3 },
    { id: 'fitness', label: 'Health & Fitness', count: 2 },
    { id: 'tech', label: 'Tech & Gadgets', count: 2 },
    { id: 'fashion', label: 'Fashion & Style', count: 2 },
    { id: 'food', label: 'Food & Beverage', count: 2 },
    { id: 'education', label: 'Education', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <span className="font-bold text-gray-900">Viral Ad Examples</span>
              </div>
            </div>
            
            {/* Navigation Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  setAuthTrigger('login');
                  setShowAuthModal(true);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  setAuthTrigger('nav_signup');
                  setShowAuthModal(true);
                }}
                className="btn-primary text-sm px-4 py-2"
              >
                Sign Up Free
              </button>
              <button 
                onClick={handleStartCreating}
                className="btn-primary text-sm px-4 py-2"
              >
                Start Creating
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary-50 rounded-full px-4 py-2 mb-4">
            <Star className="h-4 w-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-primary-700">
              Proven viral templates • 10M+ views generated
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Viral TikTok Ad{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Examples
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Browse our library of high-performing ad templates. Each example has generated 
            thousands of views and proven conversion rates.
          </p>

          {/* Quick Start CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={handleStartCreating}
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Create Your Own Ad
            </button>
            <Link href="/" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
              Try Free Demo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid sm:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white rounded-xl p-6 shadow-sm border">
              <stat.icon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.metric}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedFilter === filter.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="ml-2 text-sm opacity-75">({filter.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scarcity Indicator */}
        <div className="flex justify-center mb-8">
          <ScarcityIndicator type="trending" size="medium" />
        </div>

        {/* Templates Library */}
        <div className="bg-white rounded-xl border shadow-sm p-8 mb-16">
          <TemplateLibrary 
            onUseTemplate={handleUseTemplate} 
            showFilters={false}
            compact={false}
          />
        </div>

        {/* Pro Features Showcase */}
        {(!isAuthenticated || user?.plan === 'free') && (
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white mb-16">
            <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-2xl font-bold mb-4">Want Even More Examples?</h2>
            <p className="text-primary-100 mb-6 text-lg">
              Pro members get access to 50+ premium templates, batch generation, 
              and advanced customization options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-shadow"
                >
                  Sign Up Free
                </button>
              ) : (
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-shadow"
                >
                  Upgrade to Pro - $1.30/day
                </button>
              )}
              <Link 
                href="/"
                className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white hover:text-primary-600 transition-colors"
              >
                Try Demo First
              </Link>
            </div>
          </div>
        )}

        {/* Success Stories */}
        <div className="bg-white rounded-xl border shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Success Stories from Our Templates
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                template: "Skincare Transformation",
                creator: "Sarah M.",
                result: "2.4M views, 8.2% CTR",
                revenue: "$15K in sales"
              },
              {
                template: "Fitness Protein Powder",
                creator: "Mike R.",
                result: "890K views, 12.1% CTR",
                revenue: "$8.5K in sales"
              },
              {
                template: "Coffee Shop Revival",
                creator: "Local Business",
                result: "1.2M views, 6.8% CTR",
                revenue: "300% foot traffic"
              }
            ].map((story, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="text-sm font-medium text-primary-600 mb-2">
                  "{story.template}" Template
                </div>
                <div className="font-semibold text-gray-900 mb-2">{story.creator}</div>
                <div className="text-sm text-gray-600 mb-1">{story.result}</div>
                <div className="text-sm font-medium text-green-600">{story.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource={authTrigger}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        source="feature_gate"
      />
    </div>
  );
}