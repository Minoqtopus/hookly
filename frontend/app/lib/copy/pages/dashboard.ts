/**
 * Dashboard Page Copy
 * All text content for the dashboard page
 */

export const dashboardCopy = {
  // Page header
  welcome: {
    title: (userName: string) => `Welcome back, ${userName}! 👋`,
    streak: (days: number) => `You're on a ${days}-day streak! Keep it going 🔥`,
    noStreak: 'Ready to create some viral content?',
  },

  // Trial status
  trial: {
    label: 'Trial',
    daysLeft: (days: number) => `${days} days left`,
    upgradeButton: 'Upgrade',
  },

  // Primary CTA section
  primaryCta: {
    title: 'Create Your Next Viral Ad',
    subtitle: 'Generate high-converting ad copy in seconds with AI-powered creativity',
    button: 'Start Creating',
  },

  // Stats section
  stats: {
    sectionTitle: 'Your Performance',
    emptyState: {
      icon: '📊',
      title: 'Your Stats Will Appear Here',
      subtitle: 'Generate your first ad to start tracking performance',
    },
    labels: {
      adsCreatedToday: 'Ads created today',
      totalViews: 'Total views',
      avgCtr: 'Average CTR',
    },
  },

  // Recent work section
  recentWork: {
    sectionTitle: 'Recent Work',
    viewAll: 'View all',
    emptyState: {
      icon: '✨',
      title: 'No ads created yet',
      subtitle: 'Your viral ad creations will appear here',
      button: 'Create Your First Ad',
    },
    actions: {
      copy: 'Copy',
      share: 'Share',
    },
    labels: {
      untitled: 'Untitled Ad',
      general: 'General',
      views: (count: number) => count >= 1000 ? `${Math.round(count / 1000)}K views` : `${count} views`,
      ctr: (rate: number) => `${rate}% CTR`,
    },
  },

  // Loading states
  loading: {
    dashboard: 'Loading your dashboard...',
    redirecting: 'Redirecting...',
  },

  // Toast messages
  toasts: {
    copied: 'Ad content copied to clipboard!',
    shareLink: 'Share link copied to clipboard!',
    favoriteUpdated: 'Favorite updated!',
    favoriteError: 'Failed to update favorite',
  },
} as const;