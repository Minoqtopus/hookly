// Centralized copy management for Hookly
// This file serves as the single source of truth for all application text

export const COPY = {
  // Brand & Company
  BRAND: {
    NAME: 'Hookly',
    TAGLINE: 'Multi-Platform UGC Platform',
    DESCRIPTION: 'Create viral content for TikTok, X, Instagram, and YouTube with AI-powered tools and team collaboration.',
  },

  // Plans & Pricing
  PLANS: {
    TRIAL: {
      NAME: 'TRIAL',
      DISPLAY_NAME: 'Trial',
      PRICE: 'Free',
      GENERATIONS: '5 generations',
      DESCRIPTION: 'Get started with Hookly',
      FEATURES: [
        '5 AI-powered content generations',
        'Basic templates',
        'TikTok export',
        'Community support'
      ]
    },
    STARTER: {
      NAME: 'STARTER',
      DISPLAY_NAME: 'Starter',
      PRICE: '$15/month',
      ANNUAL_PRICE: '$150/year',
      GENERATIONS: '50 generations',
              DESCRIPTION: 'Perfect for individual creators and marketers',
      FEATURES: [
        '50 AI-powered content generations',
        'Advanced templates',
        'Multi-platform export (TikTok, X, Instagram, YouTube)',
        'Priority support',
        'Content analytics'
      ]
    },
    PRO: {
      NAME: 'PRO',
      DISPLAY_NAME: 'Pro',
      PRICE: '$49/month',
      ANNUAL_PRICE: '$490/year',
      GENERATIONS: '200 generations',
      DESCRIPTION: 'Ideal for small teams and agencies',
      FEATURES: [
        '200 AI-powered content generations',
        'Team collaboration (up to 3 members)',
        'Advanced analytics and insights',
        'Batch generation',
        'Custom templates',
        'Priority support',
        'API access'
      ]
    },
    AGENCY: {
      NAME: 'AGENCY',
      DISPLAY_NAME: 'Agency',
      PRICE: '$149/month',
      ANNUAL_PRICE: '$1,490/year',
      GENERATIONS: '500 generations',
      DESCRIPTION: 'Built for growing agencies and businesses',
      FEATURES: [
        '500 AI-powered content generations',
        'Team collaboration (up to 10 members)',
        'White-label options',
        'Advanced team analytics',
        'Custom integrations',
        'Dedicated support',
        'Enterprise features'
      ]
    }
  },

  // Platform Names
  PLATFORMS: {
    TIKTOK: 'TikTok',
    X: 'X (Twitter)',
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    ALL: ['TikTok', 'X (Twitter)', 'Instagram', 'YouTube']
  },

  // Features
  FEATURES: {
    AI_GENERATION: 'AI-Powered Content Generation',
    TEAM_COLLABORATION: 'Team Collaboration',
    MULTI_PLATFORM: 'Multi-Platform Support',
    ANALYTICS: 'Advanced Analytics',
    TEMPLATES: 'Content Templates',
    BATCH_GENERATION: 'Batch Generation',
    API_ACCESS: 'API Access',
    WHITE_LABEL: 'White-Label Options',
    CUSTOM_INTEGRATIONS: 'Custom Integrations'
  },

  // Common Actions
  ACTIONS: {
    CREATE: 'Create',
    EDIT: 'Edit',
    DELETE: 'Delete',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    SUBMIT: 'Submit',
    UPLOAD: 'Upload',
    DOWNLOAD: 'Download',
    SHARE: 'Share',
    INVITE: 'Invite',
    ACCEPT: 'Accept',
    DECLINE: 'Decline',
    UPGRADE: 'Upgrade',
    DOWNGRADE: 'Downgrade'
  },

  // Status Messages
  STATUS: {
    LOADING: 'Loading...',
    SUCCESS: 'Success!',
    ERROR: 'Error occurred',
    NO_DATA: 'No data available',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Please check your input and try again'
  },

  // Team Management
  TEAM: {
    CREATE: 'Create Team',
    INVITE_MEMBER: 'Invite Member',
    MANAGE_MEMBERS: 'Manage Members',
    TEAM_SETTINGS: 'Team Settings',
    ROLES: {
      OWNER: 'Owner',
      ADMIN: 'Admin',
      MEMBER: 'Member',
      VIEWER: 'Viewer'
    },
    PERMISSIONS: {
      OWNER: 'Full access to team management and content',
      ADMIN: 'Can manage team members and content',
      MEMBER: 'Can create and edit content',
      VIEWER: 'Can view content only'
    }
  },

  // Beta Program
  BETA: {
    TITLE: 'Apply for Beta Access',
    DESCRIPTION: 'Join our exclusive beta program and get early access to Hookly\'s team collaboration features',
    BENEFITS: [
      '30 Days Free PRO Access',
      'Early Access to New Features',
      'Direct Support',
      'Influence Product Direction'
    ],
    APPLICATION: {
      COMPANY_NAME: 'Company Name',
      INDUSTRY: 'Industry',
      TEAM_SIZE: 'Team Size',
      USE_CASE: 'Primary Use Case',
      SOCIAL_PLATFORMS: 'Social Media Platforms',
      EXPECTED_USAGE: 'Expected Monthly Usage',
      ADDITIONAL_INFO: 'Additional Information'
    }
  },

  // Navigation
  NAVIGATION: {
    DASHBOARD: 'Dashboard',
    GENERATE: 'Generate',
    HISTORY: 'History',
    TEAMS: 'Teams',
    ANALYTICS: 'Analytics',
    SETTINGS: 'Settings',
    HELP: 'Help',
    COMMUNITY: 'Community',
    RESOURCES: 'Resources'
  },

  // Dashboard
  DASHBOARD: {
    WELCOME: 'Welcome to Hookly',
    QUICK_ACTIONS: 'Quick Actions',
    RECENT_GENERATIONS: 'Recent Generations',
    TEAM_ACTIVITY: 'Team Activity',
    USAGE_STATS: 'Usage Statistics',
    UPGRADE_PROMPT: 'Upgrade your plan to unlock more features'
  },

  // Generation
  GENERATION: {
    CREATE_NEW: 'Create New Content',
    NICHE: 'Niche',
    PLATFORM: 'Platform',
    STYLE: 'Style',
    GENERATE: 'Generate',
    REGENERATE: 'Regenerate',
    SAVE: 'Save',
    SHARE: 'Share',
    EXPORT: 'Export',
    FAVORITE: 'Favorite',
    UNFAVORITE: 'Unfavorite'
  },

  // Error Messages
  ERRORS: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.',
    AUTHENTICATION: 'Please log in to continue.',
    AUTHORIZATION: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    RATE_LIMIT: 'Too many requests. Please try again later.',
    SERVER_ERROR: 'Server error. Please try again later.'
  },

  // Success Messages
  SUCCESS: {
    GENERATION_CREATED: 'Content generated successfully!',
    GENERATION_SAVED: 'Content saved successfully!',
    GENERATION_SHARED: 'Content shared successfully!',
    TEAM_CREATED: 'Team created successfully!',
    MEMBER_INVITED: 'Member invited successfully!',
    MEMBER_ADDED: 'Member added successfully!',
    MEMBER_REMOVED: 'Member removed successfully!',
    ROLE_UPDATED: 'Role updated successfully!',
    SETTINGS_SAVED: 'Settings saved successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!'
  },

  // Form Labels
  FORMS: {
    EMAIL: 'Email Address',
    PASSWORD: 'Password',
    CONFIRM_PASSWORD: 'Confirm Password',
    COMPANY_NAME: 'Company Name',
    TEAM_NAME: 'Team Name',
    DESCRIPTION: 'Description',
    MESSAGE: 'Message',
    ROLE: 'Role',
    PLATFORM: 'Platform',
    NICHE: 'Niche',
    STYLE: 'Style',
    CONTENT: 'Content'
  },

  // Placeholders
  PLACEHOLDERS: {
    EMAIL: 'Enter your email address',
    PASSWORD: 'Enter your password',
    COMPANY_NAME: 'Enter your company name',
    TEAM_NAME: 'Enter team name',
    DESCRIPTION: 'Enter description',
    MESSAGE: 'Enter your message',
    CONTENT: 'Enter your content here...',
    SEARCH: 'Search...'
  },

  // Tooltips
  TOOLTIPS: {
    UPGRADE: 'Upgrade your plan to unlock this feature',
    TEAM_FEATURE: 'Team features require PRO or AGENCY plan',
    BETA_ACCESS: 'Apply for beta access to try new features',
    USAGE_LIMIT: 'You\'ve reached your monthly generation limit',
    OVERAGE_CHARGE: 'Additional generations will incur overage charges'
  }
};

// Validation function to ensure copy consistency
export function validateCopyConsistency() {
  const issues: string[] = [];
  
  // Check for common inconsistencies
  const planNames = Object.values(COPY.PLANS).map(p => p.NAME);
  const planDisplayNames = Object.values(COPY.PLANS).map(p => p.DISPLAY_NAME);
  
  // Ensure all plan names are consistent
  if (new Set(planNames).size !== planNames.length) {
    issues.push('Duplicate plan names detected');
  }
  
  // Check platform names consistency
  const platformNames = COPY.PLATFORMS.ALL;
  if (platformNames.length !== new Set(platformNames).size) {
    issues.push('Duplicate platform names detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Helper function to get plan copy by name
export function getPlanCopy(planName: string) {
  const plan = Object.values(COPY.PLANS).find(p => 
    p.NAME.toLowerCase() === planName.toLowerCase()
  );
  
  if (!plan) {
    console.warn(`Plan copy not found for: ${planName}`);
    return COPY.PLANS.TRIAL; // Fallback to trial
  }
  
  return plan;
}

// Helper function to get platform display name
export function getPlatformDisplayName(platform: string): string {
  const platformMap: Record<string, string> = {
    'tiktok': COPY.PLATFORMS.TIKTOK,
    'x': COPY.PLATFORMS.X,
    'twitter': COPY.PLATFORMS.X,
    'instagram': COPY.PLATFORMS.INSTAGRAM,
    'youtube': COPY.PLATFORMS.YOUTUBE
  };
  
  return platformMap[platform.toLowerCase()] || platform;
}

// Export default for easy imports
export default COPY;
