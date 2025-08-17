'use client';

import { useState, useEffect } from 'react';
import { X, Crown, Check, Zap, TrendingUp, Shield, Star } from 'lucide-react';
import { useUpgrade } from '@/app/lib/useUpgrade';
import ScarcityIndicator from './ScarcityIndicator';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: 'dashboard' | 'limit_reached' | 'feature_gate' | 'nav';
}

export default function UpgradeModal({ isOpen, onClose, source = 'dashboard' }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'agency'>('pro');
  const { isUpgrading, error, upgradeToProMonthly, upgradeToProYearly, clearError } = useUpgrade();

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      clearError();
    }
  }, [isOpen, clearError]);

  const handleUpgrade = async () => {
    // For now, all plans use the same checkout flow - will be updated when backend supports multiple tiers
    const checkoutUrl = await upgradeToProMonthly();
    
    if (checkoutUrl) {
      // Redirect to LemonSqueezy checkout
      window.location.href = checkoutUrl;
    }
  };

  const getModalContent = () => {
    switch (source) {
      case 'limit_reached':
        return {
          title: '🚫 Daily Limit Reached',
          subtitle: 'Upgrade to Pro for unlimited generations',
          urgency: 'Don\'t lose momentum - upgrade now!',
        };
      case 'feature_gate':
        return {
          title: '🔒 Pro Feature',
          subtitle: 'Unlock advanced features with Pro',
          urgency: 'Join 1,000+ Pro creators making $10K+/month',
        };
      default:
        return {
          title: '👑 Upgrade to Pro',
          subtitle: 'Unlock your full creative potential',
          urgency: 'Limited time: Save 40% on yearly plans',
        };
    }
  };

  const content = getModalContent();

  const plans = {
    starter: {
      name: 'Starter',
      price: 15,
      dailyPrice: 0.50,
      billing: 'per month',
      description: 'Perfect for individual creators'
    },
    pro: {
      name: 'Pro',
      price: 39,
      dailyPrice: 1.30,
      billing: 'per month',
      description: 'Most popular for growing brands'
    },
    agency: {
      name: 'Agency',
      price: 99,
      dailyPrice: 3.30,
      billing: 'per month',
      description: 'For teams and agencies'
    }
  };

  // Default to Pro for upgrade modals
  const recommendedPlan = 'pro';

  const features = [
    { icon: Zap, text: 'Unlimited ad generations', highlight: true },
    { icon: TrendingUp, text: 'Advanced performance analytics', highlight: true },
    { icon: Crown, text: 'Batch generation (10+ ads at once)', highlight: true },
    { icon: Shield, text: 'Priority customer support', highlight: false },
    { icon: Star, text: 'Custom templates & themes', highlight: false },
    { icon: Check, text: 'No watermarks', highlight: false },
    { icon: Check, text: 'Export to all formats', highlight: false },
    { icon: Check, text: 'API access', highlight: false },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-2xl mx-auto shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-t-2xl px-8 py-8 text-white text-center">
            <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
            <p className="text-primary-100 text-lg">{content.subtitle}</p>
            {content.urgency && (
              <div className="mt-4 inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium">
                🔥 {content.urgency}
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Plan Selection */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                {Object.entries(plans).map(([planKey, plan]) => (
                  <button
                    key={planKey}
                    onClick={() => setSelectedPlan(planKey as 'starter' | 'pro' | 'agency')}
                    className={`py-3 px-2 rounded-lg font-medium transition-all text-center ${
                      selectedPlan === planKey
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600'
                    }`}
                  >
                    <div className="text-xs">{plan.name}</div>
                    <div className="text-lg font-bold">${plan.price}</div>
                  </button>
                ))}
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${plans[selectedPlan].dailyPrice}
                  <span className="text-lg font-normal text-gray-600">/day</span>
                </div>
                <p className="text-gray-600 mb-2">
                  Less than the cost of a coffee ☕
                </p>
                <p className="text-sm text-gray-500">
                  (${plans[selectedPlan].price}/{plans[selectedPlan].billing})
                </p>
                {selectedPlan === 'yearly' && plans.yearly.originalPrice && (
                  <p className="text-gray-500 mt-1">
                    <span className="line-through">${plans.yearly.originalPrice}/month</span>
                    <span className="text-green-600 font-medium ml-2">Save ${(plans.yearly.originalYearlyTotal - plans.yearly.yearlyTotal).toFixed(0)}/year!</span>
                  </p>
                )}
                <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mt-3">
                  ✨ 7-day free trial • Cancel anytime
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Everything in Pro:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      feature.highlight ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <feature.icon className={`h-3 w-3 ${
                        feature.highlight ? 'text-primary-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className={`text-sm ${
                      feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="flex justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic mb-2">
                  "Upgraded to Pro and 10x'd my ad performance in 30 days. Best investment ever!"
                </p>
                <p className="text-xs text-gray-500">- Sarah K, Fitness Creator</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Scarcity Messaging */}
            <div className="mb-6 text-center">
              <ScarcityIndicator type="limited_spots" size="small" />
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUpgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Start Free Trial - Just ${plans[selectedPlan].dailyPrice}/day
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  window.location.href = `/upgrade?source=${source}`;
                }}
                className="w-full text-primary-600 hover:text-primary-700 font-medium py-2"
              >
                View Full Pricing Details →
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center mt-4 space-y-2">
              <p className="text-xs text-gray-500">
                🔒 Secure payment • 💳 Cancel anytime • 🚀 Instant activation
              </p>
              <p className="text-xs text-gray-500">
                Trusted by <span className="font-medium">1,000+ creators</span> worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}