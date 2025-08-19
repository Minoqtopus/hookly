'use client';

import AuthModal from '@/app/components/AuthModal';
import BetaBadge from '@/app/components/BetaBadge';
import { useAuth } from '@/app/lib/AppContext';
import { getTrialLimit } from '@/app/lib/plans';
import { ArrowLeft, Check, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PRO' | 'AGENCY'>('STARTER');
  const { isAuthenticated, user } = useAuth();

  // Plans configuration - updated to reflect new pricing strategy
  const plans = [
    {
      name: 'STARTER',
      price: '$19',
      period: '/month',
              description: 'Perfect for individual creators, marketers, and small businesses',
      features: [
        '50 generations per month',
        'TikTok + X platform support',
        '15+ templates',
        'Basic analytics',
        'Email support'
      ],
      generationLimit: 50,
      popular: false
    },
    {
      name: 'PRO',
      price: '$59',
      period: '/month',
      description: 'Ideal for growing businesses and marketing teams',
      features: [
        '200 generations per month',
        'TikTok + X + Instagram support',
        '50+ templates',
        'Batch generation (up to 10)',
        'Advanced analytics',
        'Team collaboration (up to 3 users)',
        'Priority support'
      ],
      generationLimit: 200,
      popular: true
    },
    {
      name: 'AGENCY',
      price: '$129',
      period: '/month',
      description: 'Built for agencies and enterprise teams',
      features: [
        '500 generations per month',
        'All platforms + API access',
        '100+ templates',
        'Batch generation (up to 25)',
        'Advanced analytics + team insights',
        'Team collaboration (up to 10 users)',
        'White-label options',
        'Dedicated support'
      ],
      generationLimit: 500,
      popular: false
    }
  ];

  const faqData = [
    {
      question: 'Can I try Hookly before committing to a paid plan?',
      answer: `Absolutely! You can try our free demo (1 generation per day) or start a 7-day free trial with ${getTrialLimit()} generations to test our platform with no credit card required.`
    },
    {
      question: 'What happens if I exceed my monthly generation limit?',
      answer: 'You can upgrade to a higher plan or wait until your monthly limit resets. We\'ll notify you when you\'re approaching your limit so you can plan accordingly.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with Hookly, contact our support team for a full refund.'
    },
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.'
    },
    {
      question: 'Is there a free plan?',
      answer: 'We offer a free demo and 7-day free trial instead of a permanent free plan. This ensures we can maintain high-quality AI generation and support for all users.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through LemonSqueezy.'
    }
  ];

  const handleSelectPlan = (planId: 'STARTER' | 'PRO' | 'AGENCY') => {
    setSelectedPlan(planId);
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Beta users already have Agency plan for free
    if (user?.is_beta_user && planId === 'AGENCY') {
      window.location.href = '/dashboard?welcome=beta';
      return;
    }
    
    // Redirect to upgrade flow for authenticated users
    window.location.href = `/upgrade?plan=${planId.toLowerCase()}`;
  };

  const getTriggerSource = () => {
    if (selectedPlan === 'STARTER') {
      return 'starter_plan_signup';
    } else if (selectedPlan === 'PRO') {
      return 'pro_plan_signup';
    } else if (selectedPlan === 'AGENCY') {
      return 'agency_plan_signup';
    }
    return 'pricing_page';
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <span className="font-bold text-gray-900">Hookly Pricing</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/demo" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Try Demo
              </Link>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="btn-primary text-sm px-6 py-2"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Beta User Banner */}
        {user?.is_beta_user && (
          <BetaBadge variant="banner" className="max-w-4xl mx-auto" />
        )}

        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include our viral AI technology, 
            professional templates, and advanced performance analytics.
          </p>
          
          {/* Trial CTA */}
          {!user?.is_beta_user && (
            <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Zap className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Start with a 7-day free trial • No credit card required
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular 
                  ? 'border-primary-500 ring-4 ring-primary-100' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                {user?.is_beta_user && plan.name === 'AGENCY' ? (
                  <div>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-green-600">FREE</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1 font-medium">
                      🎉 Beta Tester Exclusive
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.name as 'STARTER' | 'PRO' | 'AGENCY')}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.name} Plan
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                Generation Limit: {plan.generationLimit}
              </p>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cost Per Generation
            </h2>
            <p className="text-gray-600">
              See how much you save compared to hiring copywriters or other tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Freelance Copywriter</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">$50-200</div>
              <div className="text-sm text-gray-600">per ad script</div>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-6 border-2 border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-2">Hookly Starter</h3>
              <div className="text-3xl font-bold text-primary-900 mb-1">$0.38</div>
              <div className="text-sm text-primary-700">per generation</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-2">Hookly Agency</h3>
              <div className="text-3xl font-bold text-purple-900 mb-1">$0.26</div>
              <div className="text-sm text-purple-700">per generation</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about Hookly pricing and plans
            </p>
          </div>
          
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Viral Ads?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of creators and marketers who trust Hookly to generate high-converting ad scripts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo" className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition-all duration-200">
                Try Free Demo
              </Link>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 shadow-lg transition-all duration-200"
              >
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource={getTriggerSource()}
      />
    </div>
  );
}