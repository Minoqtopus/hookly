import { getTrialLimit } from '../../pricing';

// Demo page specific copy
export const demoPage = {
  form: {
    badge: 'Free Demo - See what Hookly can create!',
    title: {
      prefix: 'Create Your First',
      highlight: 'Viral Ad',
      suffix: '✨'
    },
    subtitle: 'Our AI analyzes millions of viral TikTok ads to create scripts that actually convert. Experience the power of AI-driven copywriting - no signup required for this demo!',
    
    limitations: {
      title: 'Demo Limitations',
      text: {
        prefix: 'This demo is limited to 1 generation per day.',
        linkText: 'Start your free trial',
        suffix: 'for {{trialLimit}} generations and full access to our platform.'
      }
    },
    
    quickStart: {
      title: '🚀 Quick Start Ideas',
      suggestions: [
        { productName: 'Wireless Earbuds', niche: 'Tech', targetAudience: 'Music lovers aged 18-35' },
        { productName: 'Skincare Serum', niche: 'Beauty', targetAudience: 'Women aged 25-45 with skin concerns' },
        { productName: 'Protein Powder', niche: 'Fitness', targetAudience: 'Gym enthusiasts and athletes' },
        { productName: 'Coffee Blend', niche: 'Food & Beverage', targetAudience: 'Coffee enthusiasts aged 25-50' }
      ]
    },
    
    fields: {
      productName: {
        label: '📦 Product Name',
        placeholder: 'e.g., Wireless Bluetooth Earbuds',
        helpText: 'Be specific - this helps our AI create more targeted content'
      },
      niche: {
        label: '🎯 Niche/Category',
        placeholder: 'e.g., Tech, Beauty, Fitness, Fashion'
      },
      targetAudience: {
        label: '👥 Target Audience',
        placeholder: 'e.g., Music lovers aged 18-35 who commute daily',
        helpText: 'Include age, interests, and pain points for better targeting'
      }
    },
    
    generateButton: {
      loading: 'Creating your viral ad...',
      default: 'Generate My Ad'
    }
  },
  
  results: {
    header: {
      title: 'Your Demo Ad is Ready! 🎉',
      subtitle: 'Here\'s your viral TikTok ad created with AI'
    },
    
    performance: {
      title: '📊 Estimated Performance',
      metrics: {
        views: 'Est. Views',
        ctr: 'Est. CTR', 
        viralScore: 'Viral Score'
      }
    },
    
    sections: {
      hook: 'Hook (First 3 seconds)',
      script: 'Full Script',
      visuals: '📹 Visual Suggestions'
    },
    
    conversion: {
      title: '🎉 Love your demo ad?',
      subtitle: 'Save this ad and create {{trialLimit}} more with your free trial - no credit card required!',
      benefits: {
        title: 'Your Free Trial Includes:',
        items: [
          '✅ Save this ad to your account',
          '✅ Generate {{trialLimit}} more ads (7-day trial)',
          '✅ Access to all templates',
          '✅ Advanced performance analytics'
        ]
      },
      buttons: {
        primary: 'Save Ad + Start Free Trial',
        secondary: 'View Pricing'
      },
      disclaimer: 'Takes 30 seconds • No spam, we promise'
    },
    
    tryAgainButton: 'Try Another Demo',
    copiedMessage: '✓ Copied to clipboard!',
    copyFields: {
      hook: 'Hook',
      script: 'Script'
    },
    
    errors: {
      generateFailed: 'Failed to generate demo ad',
      generalError: 'An error occurred',
      copyFailed: 'Failed to copy'
    }
  },
  
  stickyBar: {
    title: 'Ready to create more viral ads?',
    subtitle: 'Start your free trial - no credit card required',
    button: 'Start Free Trial',
    closeButton: '×',
    features: [
      '✅ {{trialLimit}} generations',
      '✅ Save & export ads',
      '✅ Advanced analytics'
    ]
  }
} as const;

// Helper function to replace template variables
export const getProcessedDemoContent = () => {
  const trialLimit = getTrialLimit();
  
  return {
    ...demoPage,
    form: {
      ...demoPage.form,
      limitations: {
        ...demoPage.form.limitations,
        text: {
          ...demoPage.form.limitations.text,
          suffix: demoPage.form.limitations.text.suffix.replace('{{trialLimit}}', trialLimit.toString())
        }
      }
    },
    results: {
      ...demoPage.results,
      conversion: {
        ...demoPage.results.conversion,
        subtitle: demoPage.results.conversion.subtitle.replace('{{trialLimit}}', trialLimit.toString()),
        benefits: {
          ...demoPage.results.conversion.benefits,
          items: demoPage.results.conversion.benefits.items.map(item => 
            item.replace('{{trialLimit}}', trialLimit.toString())
          )
        }
      }
    },
    stickyBar: {
      ...demoPage.stickyBar,
      features: demoPage.stickyBar.features.map(feature => 
        feature.replace('{{trialLimit}}', trialLimit.toString())
      )
    }
  };
};