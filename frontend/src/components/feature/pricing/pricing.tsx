"use client";

import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { FaqItem } from "./FaqItem";
import { PricingCard } from "./PricingCard";
import { fetchPricingConfig, formatPrice, getPricingForBillingCycle, type PricingConfiguration, type PricingTier } from "@/lib/pricing-api";

// Fallback plans (if API fails)
const fallbackPlans = {
  monthly: [
    {
      name: "Starter",
      price: "$24",
      description: "For creators getting started with viral content.",
      features: [
        "Up to 50 generations/month",
        "Access to TikTok & Instagram",
        "Standard AI model",
        "Basic performance analytics",
        "Email support",
      ],
      isRecommended: false,
    },
    {
      name: "Pro",
      price: "$59",
      description: "For creators scaling their content strategy.",
      features: [
        "Up to 200 generations/month",
        "Access to TikTok, Instagram & YouTube",
        "Premium AI model",
        "Advanced performance analytics",
        "Priority email support",
        "Access to new features",
      ],
      isRecommended: true,
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: "$19",
      description: "For creators getting started with viral content.",
      features: [
        "Up to 50 generations/month",
        "Access to TikTok & Instagram",
        "Standard AI model",
        "Basic performance analytics",
        "Email support",
      ],
      isRecommended: false,
    },
    {
      name: "Pro",
      price: "$49",
      description: "For creators scaling their content strategy.",
      features: [
        "Up to 200 generations/month",
        "Access to TikTok, Instagram & YouTube",
        "Premium AI model",
        "Advanced performance analytics",
        "Priority email support",
        "Access to new features",
      ],
      isRecommended: true,
    },
  ],
};

const faqs = [
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the current billing cycle.",
  },
  {
    question: "What counts as a 'generation'?",
    answer:
      "A generation is counted each time you run the AI to create a new script or set of ideas. Editing or refining a script does not count as a new generation.",
  },
  {
    question: "What is the difference between the Standard and Premium AI models?",
    answer:
      "The Premium AI model is a more advanced and powerful model that generally produces higher-quality, more creative, and more nuanced content.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. The changes will be prorated.",
  },
];

export const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPricing() {
      try {
        const config = await fetchPricingConfig();
        setPricingConfig(config);
      } catch (err) {
        console.error('Failed to load pricing config:', err);
        setError('Failed to load pricing');
      } finally {
        setLoading(false);
      }
    }
    
    loadPricing();
  }, []);

  // Convert API data to component format
  const getCurrentPlans = () => {
    if (pricingConfig) {
      const tiersWithPricing = getPricingForBillingCycle(pricingConfig.tiers, isYearly ? 'yearly' : 'monthly');
      return tiersWithPricing.map(tier => ({
        name: tier.name,
        price: formatPrice(tier.displayPrice, pricingConfig.currencySymbol),
        description: tier.description,
        features: tier.features.map(f => f.name),
        isRecommended: tier.isRecommended
      }));
    }
    
    // Fallback to static plans
    return isYearly ? fallbackPlans.yearly : fallbackPlans.monthly;
  };

  const currentPlans = getCurrentPlans();

  return (
    <div className="py-24 sm:py-32">
      <div className="container">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {pricingConfig?.headline || 'Pricing Plans for Every Creator'}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {pricingConfig?.subheadline || 'Choose the plan that fits your content creation needs. Cancel anytime.'}
          </p>
          {loading && (
            <p className="mt-4 text-sm text-muted-foreground">Loading pricing...</p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-500">Using cached pricing data</p>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-4">
            <span className="font-medium">Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Switch between monthly and yearly pricing"
            />
            <span className="font-medium">
              Yearly <span className="text-primary">(Save up to 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mt-12 grid max-w-md grid-cols-1 gap-8 mx-auto lg:max-w-4xl lg:grid-cols-2">
          {currentPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 space-y-8">
              {faqs.map((faq) => (
                <FaqItem key={faq.question} faq={faq} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
