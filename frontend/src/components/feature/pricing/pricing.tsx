"use client";

import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useAnalytics } from "@/shared/services";
import { FaqItem } from "./FaqItem";
import { PricingCard } from "./PricingCard";
import {
  fetchPricingConfig,
  formatPrice,
  getPricingForBillingCycle,
  type PricingConfiguration,
  type PricingTier,
} from "@/lib/pricing-api";

const faqs = [
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the current billing cycle.",
  },
  {
    question: "What counts as a 'script generation'?",
    answer:
      "Each time you generate a UGC script for TikTok or Instagram (title, hook, and full script) counts as one generation. You can copy and edit the generated content without using additional generations.",
  },
  {
    question: "What platforms do you support?",
    answer:
      "We support TikTok and Instagram - the two biggest platforms for UGC creators. Our AI generates authentic, creator-focused scripts optimized for maximum engagement and audience building.",
  },
  {
    question: "How does the AI generate UGC scripts?",
    answer:
      "Our AI analyzes viral UGC patterns and creates authentic scripts that feel natural for creators. Each script includes compelling hooks, storytelling elements, and calls-to-action tailored to your personal brand and audience.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. The changes will be prorated and take effect immediately.",
  },
  {
    question: "Do I get commercial usage rights?",
    answer:
      "Creator plan scripts are perfect for personal brand building. Business plan includes full commercial usage rights, meaning you can use the scripts for client work and agency purposes.",
  },
];

export const Pricing = () => {
  const analytics = useAnalytics();
  const [isYearly, setIsYearly] = useState(false);
  const [pricingConfig, setPricingConfig] =
    useState<PricingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPricing() {
      try {
        console.log("Fetching fresh pricing config...");
        const config = await fetchPricingConfig();
        console.log("Received pricing config:", config);
        setPricingConfig(config);
        setError(null);
        
        // Track pricing page view
        analytics.trackPricingPageViewed('direct');
      } catch (err) {
        console.error("Failed to load pricing config:", err);
        setError("Failed to load pricing - please refresh");
      } finally {
        setLoading(false);
      }
    }

    loadPricing();
  }, [analytics]);

  // Convert API data to component format - BACKEND ONLY, NO FALLBACKS
  const getCurrentPlans = () => {
    if (
      !pricingConfig ||
      !pricingConfig.tiers ||
      pricingConfig.tiers.length === 0
    ) {
      return []; // Force empty state until backend loads
    }

    const tiersWithPricing = getPricingForBillingCycle(
      pricingConfig.tiers,
      isYearly ? "yearly" : "monthly"
    );
    return tiersWithPricing.map((tier) => ({
      name: tier.name,
      price: formatPrice(tier.displayPrice, pricingConfig.currencySymbol),
      description: tier.description,
      features: tier.features.map((f) => f.name),
      isRecommended: tier.isRecommended,
    }));
  };

  const currentPlans = getCurrentPlans();

  // Show full page loading initially
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-24 md:py-32">
      <div className="container px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {pricingConfig?.headline || "Pricing Plans for Every Creator"}
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
            {pricingConfig?.subheadline ||
              "Choose the plan that fits your content creation needs. Cancel anytime."}
          </p>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="font-medium text-sm sm:text-base">Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Switch between monthly and yearly pricing"
            />
            <span className="font-medium text-xs sm:text-base">
              Yearly <span className="text-primary">(Save up to 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mt-8 sm:mt-12 grid max-w-md grid-cols-1 gap-6 sm:gap-8 mx-auto lg:max-w-4xl lg:grid-cols-2">
          {currentPlans.length > 0 ? (
            currentPlans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))
          ) : (
            <div className="col-span-2 text-center">
              <p className="text-red-500">
                Failed to load pricing data. Please refresh the page.
              </p>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-16 sm:mt-20 md:mt-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              Frequently Asked Questions
            </h2>
            <div className="mt-6 sm:mt-8 md:mt-10 space-y-6 sm:space-y-8">
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
