"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { FaqItem } from "./FaqItem";
import { PricingCard } from "./PricingCard";

const plans = {
  monthly: [
    {
      name: "Starter",
      price: "$24",
      description: "For creators getting started with viral content.",
      features: [
        "Up to 15 generations/month",
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
        "Up to 50 generations/month",
        "Access to TikTok, Instagram & X",
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
        "Up to 15 generations/month",
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
        "Up to 50 generations/month",
        "Access to TikTok, Instagram & X",
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
  const currentPlans = isYearly ? plans.yearly : plans.monthly;

  return (
    <div className="py-24 sm:py-32">
      <div className="container">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Pricing Plans for Every Creator
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the plan that fits your content creation needs. Cancel anytime.
          </p>
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
