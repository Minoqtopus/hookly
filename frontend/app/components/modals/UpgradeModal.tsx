'use client';

import { Check, Crown, Shield, Star, TrendingUp, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScarcityIndicator } from '../public';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: 'dashboard' | 'limit_reached' | 'feature_gate' | 'nav';
}

export default function UpgradeModal({ isOpen, onClose, source = 'dashboard' }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'agency'>('starter');
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  const plans = {
    starter: {
      name: 'Starter',
      price: 29,
      features: [
        'Unlimited AI generations',
        'Advanced targeting options',
        'Performance analytics',
        'Content export tools',
        'Email support'
      ]
    },
    agency: {
      name: 'Agency',
      price: 99,
      features: [
        'Everything in Starter',
        'Team collaboration',
        'White-label options',
        'Priority support',
        'Custom integrations',
        'Advanced reporting'
      ]
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Mock upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Upgrade to Pro</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Unlimited Viral Content Creation
            </h3>
            <p className="text-gray-600">
              Join thousands of creators and marketers scaling their social media success
            </p>
          </div>

          <ScarcityIndicator />

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setSelectedPlan(key as 'starter' | 'agency')}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                  selectedPlan === key
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                  {key === 'agency' && (
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpgrading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Crown className="h-5 w-5" />
                Upgrade to {plans[selectedPlan].name} - ${plans[selectedPlan].price}/month
              </>
            )}
          </button>

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>30-day money back</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Instant activation</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}