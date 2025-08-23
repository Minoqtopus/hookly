// Content generation feature copy
export const generation = {
  actions: {
    generate: 'Generate Content',
    regenerate: 'Regenerate',
    save: 'Save',
    copy: 'Copy',
    share: 'Share',
    export: 'Export',
    favorite: 'Add to Favorites',
  },
  
  status: {
    generating: 'Creating your viral content...',
    success: 'Content generated successfully!',
    error: 'Failed to generate content. Please try again.',
    saved: 'Content saved to your library',
    copied: 'Copied to clipboard!',
  },
  
  labels: {
    hook: 'Hook',
    script: 'Script',
    visuals: 'Visual Suggestions',
    performance: 'Performance Prediction',
    estimatedViews: 'Estimated Views',
    estimatedCTR: 'Estimated CTR',
    viralScore: 'Viral Score',
  },
  
  limits: {
    reachedMonthly: 'You\'ve reached your monthly generation limit',
    reachedTrial: 'You\'ve reached your trial generation limit',
    upgradeRequired: 'Upgrade your plan to generate more content',
  },
} as const;