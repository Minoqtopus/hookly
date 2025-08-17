'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Crown, 
  Check, 
  X, 
  Star, 
  Zap, 
  TrendingUp, 
  Shield, 
  Users,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/app/lib/AppContext';
import { useUpgrade } from '@/app/lib/useUpgrade';
import ScarcityIndicator from '@/app/components/ScarcityIndicator';
import Link from 'next/link';

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'agency'>('pro'); // Default to pro for better value
  const [showTestimonials, setShowTestimonials] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'direct';
  const { user, isAuthenticated } = useAuth();
  const { isUpgrading, error, upgradeToProMonthly, upgradeToProYearly, clearError } = useUpgrade();

  // Redirect non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/upgrade')}`);
    }
  }, [isAuthenticated, router]);

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show testimonials after 10 seconds to add social proof
  useEffect(() => {
    const timer = setTimeout(() => setShowTestimonials(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpgrade = async () => {
    // For now, all plans use the same checkout flow - will be updated when backend supports multiple tiers
    const checkoutUrl = await upgradeToProMonthly();
    
    if (checkoutUrl) {
      // Track conversion event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'begin_checkout', {
          currency: 'USD',
          value: plans[selectedPlan].price,
          items: [{
            item_id: `${selectedPlan}_monthly`,
            item_name: `Hookly ${plans[selectedPlan].name}`,
            category: 'subscription',
            quantity: 1,
            price: plans[selectedPlan].price
          }]
        });
      }
      
      window.location.href = checkoutUrl;
    }
  };

  const getSourceContent = () => {
    switch (source) {
      case 'limit_reached':
        return {
          headline: "You've Hit Your Daily Limit! 🚫",
          subheadline: "Don't let limits slow down your creative momentum",
          urgency: "Upgrade now and continue creating viral content",
          cta: "Remove All Limits Now"
        };
      case 'generator':
        return {
          headline: "Love That Ad? Create Unlimited More! 🚀",
          subheadline: "Join 1,000+ Pro creators generating millions in ad revenue",
          urgency: "Limited time: Save 40% on yearly plans",
          cta: "Unlock Unlimited Power"
        };
      case 'dashboard':
        return {
          headline: "Ready to Scale Your Ad Creation? 📈",
          subheadline: "Pro users generate 10x more viral content",
          urgency: "Most popular plan - join the pros",
          cta: "Upgrade to Pro Now"
        };
      default:
        return {
          headline: "Create Unlimited Viral Ads 🔥",
          subheadline: "Join the creators making $100K+ with AI-generated UGC ads",
          urgency: "Limited time: Save 40% on yearly plans",
          cta: "Start Free Trial"
        };
    }
  };

  const content = getSourceContent();

  const plans = {
    starter: {
      name: 'Starter',
      price: 15,
      dailyPrice: 0.50,
      billing: 'per month',
      description: 'Perfect for individual creators',
      generationsLimit: 50,
      popular: false,
      features: ['50 generations/month', 'Basic templates', 'Standard support', 'Export to text/PDF']
    },
    pro: {
      name: 'Pro',
      price: 39,
      dailyPrice: 1.30,
      billing: 'per month',
      description: 'Most popular for growing brands',
      generationsLimit: 'unlimited',
      popular: true,
      features: ['Unlimited generations', 'Advanced analytics', 'Batch generation', 'Priority support', 'No watermarks', 'API access']
    },
    agency: {
      name: 'Agency',
      price: 99,
      dailyPrice: 3.30,
      billing: 'per month',
      description: 'For teams and agencies',
      generationsLimit: 'unlimited',
      popular: false,
      features: ['Everything in Pro', 'Team collaboration', 'White-label options', 'Custom integrations', 'Dedicated account manager', 'Advanced reporting']
    }
  };

  const features = [
    { 
      icon: Zap, 
      title: 'Unlimited Ad Generations', 
      description: 'Generate as many viral ads as you need - no daily limits',
      highlight: true 
    },
    { 
      icon: TrendingUp, 
      title: 'Advanced Performance Analytics', 
      description: 'Track views, CTR, conversions with detailed insights',
      highlight: true 
    },
    { 
      icon: Crown, 
      title: 'Batch Generation (10+ ads)', 
      description: 'Create multiple ad variations at once for A/B testing',
      highlight: true 
    },
    { 
      icon: Shield, 
      title: 'Priority Support', 
      description: '24/7 priority customer support via chat and email',
      highlight: false 
    },
    { 
      icon: Star, 
      title: 'Custom Templates & Themes', 
      description: 'Access premium templates and custom branding options',
      highlight: false 
    },
    { 
      icon: CheckCircle, 
      title: 'No Watermarks', 
      description: 'Clean, professional ads without Hookly branding',
      highlight: false 
    },
    { 
      icon: Users, 
      title: 'Team Collaboration', 
      description: 'Share ads with team members and manage permissions',
      highlight: false 
    },
    { 
      icon: Sparkles, 
      title: 'Early Access to New Features', 
      description: 'Be first to try new AI models and generation features',
      highlight: false 
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "E-commerce Brand Owner",
      content: "Upgraded to Pro and 10x'd my ad performance in 30 days. Generated over $50K in revenue from Hookly ads. Best investment ever!",
      rating: 5,
      revenue: "$50K in 30 days"
    },
    {
      name: "Mike Chen",
      title: "Marketing Agency Founder",
      content: "The batch generation feature saves me 20+ hours per week. My clients are seeing 300% better CTR with these AI-generated ads.",
      rating: 5,
      revenue: "300% better CTR"
    },
    {
      name: "Emily Rodriguez", 
      title: "TikTok Creator",
      content: "Went from 10K to 500K followers using Pro. The unlimited generations let me test so many variations. Game changer!",
      rating: 5,
      revenue: "500K followers"
    }
  ];

  const comparisonData = [
    { feature: "Daily generations", free: "3", pro: "Unlimited" },
    { feature: "Watermarks", free: "Yes", pro: "None" },
    { feature: "Performance analytics", free: "Basic", pro: "Advanced" },
    { feature: "Batch generation", free: "No", pro: "Yes (10+)" },
    { feature: "Priority support", free: "No", pro: "24/7" },
    { feature: "Custom templates", free: "No", pro: "Yes" },
    { feature: "Team features", free: "No", pro: "Yes" },
    { feature: "API access", free: "No", pro: "Yes" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-primary-600" />
              <span className="font-bold text-gray-900">Upgrade to Pro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
            <Clock className="h-4 w-4 mr-2" />
            {content.urgency}
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {content.headline}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {content.subheadline}
          </p>

          {/* Social Proof */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-primary-100 border-2 border-white rounded-full"></div>
                ))}
              </div>
              <span>1,000+ Pro users</span>
            </div>
            <div className="flex items-center">
              <div className="flex space-x-1 mr-2">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </div>

          {/* Scarcity Indicators */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <ScarcityIndicator type="limited_spots" size="medium" />
            <ScarcityIndicator type="recent_signups" size="medium" />
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-16">
          {Object.entries(plans).map(([planKey, plan]) => (
            <div 
              key={planKey}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
                selectedPlan === planKey ? 'border-primary-500 shadow-xl scale-105' : 'border-gray-200'
              } ${plan.popular ? 'lg:scale-110' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    🔥 Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${plan.dailyPrice}
                    <span className="text-lg font-normal text-gray-600">/day</span>
                  </div>
                  <p className="text-gray-600 mb-1">
                    {planKey === 'starter' ? 'Less than a snack 🍿' : 
                     planKey === 'pro' ? 'Less than a coffee ☕' : 'Less than a lunch 🍕'}
                  </p>
                  <p className="text-sm text-gray-500">(${plan.price}/month)</p>
                  
                  <div className="mt-4">
                    <span className="text-lg font-semibold text-primary-600">
                      {plan.generationsLimit === 'unlimited' ? 'Unlimited' : `${plan.generationsLimit}`} 
                      {plan.generationsLimit !== 'unlimited' && ' generations'}
                    </span>
                  </div>
                </div>
                
                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setSelectedPlan(planKey as 'starter' | 'pro' | 'agency')}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    selectedPlan === planKey
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === planKey ? 'Selected' : `Select ${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Everything You Get with Pro
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                  feature.highlight ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.highlight ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-2 ${
                  feature.highlight ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Free vs Pro Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-primary-600">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row.free}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center text-primary-600 font-semibold">
                        {row.pro}
                        {row.pro !== 'No' && <Check className="h-4 w-4 ml-1" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        {showTestimonials && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              What Pro Users Are Saying
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                    <div className="text-sm font-medium text-green-600 mt-1">
                      📈 {testimonial.revenue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join 1,000+ Pro Creators?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Start your 7-day free trial today. Cancel anytime.
          </p>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="bg-white text-primary-600 font-bold text-xl px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isUpgrading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2 inline-block"></div>
                Processing...
              </>
            ) : (
              <>
                {content.cta} - Just ${plans[selectedPlan].dailyPrice}/day
              </>
            )}
          </button>

          <div className="flex justify-center items-center space-x-6 mt-6 text-sm text-primary-100">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Secure Payment
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              7-Day Free Trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Cancel Anytime
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center bg-green-50 text-green-700 px-6 py-3 rounded-full">
            <Shield className="h-5 w-5 mr-2" />
            <span className="font-medium">30-Day Money-Back Guarantee</span>
          </div>
          <p className="text-gray-600 mt-2 text-sm">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}