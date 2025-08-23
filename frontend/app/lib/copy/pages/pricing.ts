import { pricingConfig } from '../../pricing';

// Pricing page specific copy (UI text only, data imported from centralized pricing)
export const pricingPage = {
  header: {
    title: 'Simple, Transparent Pricing',
    subtitle: 'Choose the plan that fits your needs. All plans include our viral AI technology, professional templates, and advanced performance analytics.',
  },
  
  trial: {
    name: 'Trial',
    duration: '7 days',
    price: 'Free',
    description: 'Get started with Hookly',
  },
  
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about Hookly pricing and plans',
    items: [
      {
        question: 'Can I try Hookly before committing to a paid plan?',
        answer: `Absolutely! You can try our free demo (1 generation per day) or start a 7-day free trial with {{trialLimit}} generations to test our platform with no credit card required.`
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
    ]
  },
  
  costBreakdown: {
    title: 'Cost Per Generation',
    subtitle: 'See how much you save compared to hiring copywriters or other tools',
  },
  
  finalCta: {
    title: 'Ready to Create Viral Ads?',
    subtitle: 'Join thousands of creators and marketers who trust Hookly to generate high-converting ad scripts',
    demoButton: 'Try Free Demo',
    trialButton: 'Start 7-Day Free Trial',
  },
} as const;

// Re-export pricing data for convenience
export const { plans: pricingPlans, trialLimit, costPerGeneration, comparison } = pricingConfig;

// Helper function to replace template variables in FAQ answers
export const getProcessedFaqItems = () => {
  return pricingPage.faq.items.map(item => ({
    ...item,
    answer: item.answer.replace('{{trialLimit}}', trialLimit.toString())
  }));
};