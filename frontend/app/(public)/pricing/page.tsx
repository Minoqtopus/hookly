'use client';

import AuthModal from '@/app/components/AuthModal';
import { pricingPage, pricingPlans, trialLimit, costPerGeneration, comparison, getProcessedFaqItems } from '@/app/lib/copy/pages/pricing';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PRO'>('STARTER');

  // Use centralized pricing data
  const plans = pricingPlans;

  // Use FAQ data from copy file
  const faqData = getProcessedFaqItems();

  const handleSelectPlan = (planId: 'STARTER' | 'PRO') => {
    setSelectedPlan(planId);
    setShowAuthModal(true);
  };

  const getTriggerSource = () => {
    if (selectedPlan === 'STARTER') {
      return 'starter_plan_signup';
    } else if (selectedPlan === 'PRO') {
      return 'pro_plan_signup';
    }
    return 'pricing_page';
  };

  return (
    <div className="min-h-screen">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Banner removed - no user context in public page */}

        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {pricingPage.header.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {pricingPage.header.subtitle}
          </p>
          
          {/* Trial CTA */}
          <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <Zap className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Start with a 7-day free trial ({trialLimit} generations) • No credit card required
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 flex flex-col ${
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
                <div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.name as 'STARTER' | 'PRO')}
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
              {pricingPage.costBreakdown.title}
            </h2>
            <p className="text-gray-600">
              {pricingPage.costBreakdown.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{pricingPage.costBreakdown.labels.freelancer}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">{comparison.freelancer.cost}</div>
              <div className="text-sm text-gray-600">{comparison.freelancer.description}</div>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-6 border-2 border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-2">{pricingPage.costBreakdown.labels.starter}</h3>
              <div className="text-3xl font-bold text-primary-900 mb-1">{comparison.starter.cost}</div>
              <div className="text-sm text-primary-700">{comparison.starter.description}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-2">{pricingPage.costBreakdown.labels.pro}</h3>
              <div className="text-3xl font-bold text-purple-900 mb-1">{comparison.pro.cost}</div>
              <div className="text-sm text-purple-700">{comparison.pro.description}</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {pricingPage.faq.title}
            </h2>
            <p className="text-gray-600">
              {pricingPage.faq.subtitle}
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
              {pricingPage.finalCta.title}
            </h2>
            <p className="text-xl mb-6 opacity-90">
              {pricingPage.finalCta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo" className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition-all duration-200">
                {pricingPage.finalCta.demoButton}
              </Link>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 shadow-lg transition-all duration-200"
              >
                {pricingPage.finalCta.trialButton}
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