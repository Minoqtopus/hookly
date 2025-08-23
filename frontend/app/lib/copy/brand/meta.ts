import { Metadata } from 'next';

// SEO metadata and page titles
export const meta = {
  default: {
    title: 'Hookly - AI-Powered Viral Social Ads Generator | Create TikTok, Instagram & X Content in 30 Seconds',
    description: 'Generate viral UGC content for TikTok, Instagram, and X that actually converts. AI-powered social media ad creator used by 10,000+ marketers. Free 7-day trial, no credit card required. Create high-converting social ads, viral hooks, and engaging scripts in seconds.',
    keywords: [
      // Primary keywords
      'AI social media content generator',
      'viral TikTok ad creator',
      'Instagram content generator',
      'X Twitter ad creator',
      'UGC ad generator',
      'viral content creator AI',
      
      // Long-tail keywords
      'create viral social media ads',
      'AI powered content generation',
      'social media marketing automation',
      'viral hook generator',
      'TikTok ad script generator',
      'Instagram ad creator tool',
      'social media copywriting AI',
      'viral content marketing tool',
      'UGC content creator',
      'social ads that convert',
      
      // Intent keywords
      'how to create viral ads',
      'social media ad creator',
      'viral marketing tool',
      'content creator for brands',
      'AI marketing assistant',
      'social media content automation',
      'viral ad templates',
      'social media ROI tools',
      
      // Commercial keywords
      'best AI content generator',
      'social media marketing software',
      'content creation platform',
      'viral marketing automation',
      'social media ad platform',
      'AI copywriting tool',
      'content marketing software',
      'social media growth tool'
    ] as string[],
    authors: [{ name: 'Hookly Team' }] as { name: string }[],
    creator: 'Hookly',
    publisher: 'Hookly',
    applicationName: 'Hookly',
    referrer: 'origin-when-cross-origin',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    canonical: 'https://hookly.ai',
    alternates: {
      languages: {
        'en-US': 'https://hookly.ai',
        'x-default': 'https://hookly.ai'
      }
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'Hookly',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web',
      'description': 'AI-powered viral social media content generator for TikTok, Instagram, and X',
      'url': 'https://hookly.ai',
      'author': {
        '@type': 'Organization',
        'name': 'Hookly Team'
      },
      'offers': {
        '@type': 'Offer',
        'price': '19',
        'priceCurrency': 'USD',
        'priceValidUntil': '2025-12-31',
        'availability': 'https://schema.org/InStock'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'reviewCount': '1250',
        'bestRating': '5'
      }
    }
  },
  
  pages: {
    pricing: {
      title: 'Pricing - Hookly AI Content Generation Plans',
      description: 'Simple, transparent pricing for AI-powered viral content creation. Choose the plan that fits your needs. Starting at $19/month with 7-day free trial.',
    },
    
    demo: {
      title: 'Free Demo - Try Hookly AI Content Generation',
      description: 'Experience Hookly\'s AI in action. Generate viral content ideas in seconds. No account needed. See how our AI creates high-converting social ads.',
    },
    
    dashboard: {
      title: 'Dashboard - Hookly AI Content Platform',
      description: 'Create and manage your viral content with Hookly\'s AI-powered platform. Generate, export, and track your social media campaigns.',
    },
  },
  
  openGraph: {
    siteName: 'Hookly',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hookly - AI-Powered Viral Social Ads',
      },
    ] as { url: string; width: number; height: number; alt: string }[],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Hookly - AI-Powered Viral Social Ads',
    description: 'Create viral UGC content for TikTok, Instagram, and X in 30 seconds',
    images: ['/og-image.png'] as string[],
    creator: '@hookly',
    site: '@hookly',
  },
} as const;

// Helper function to generate complete metadata
export const generateMetadata = (pageKey?: keyof typeof meta.pages): Metadata => {
  const page = pageKey ? meta.pages[pageKey] : null;
  
  return {
    title: page?.title || meta.default.title,
    description: page?.description || meta.default.description,
    keywords: meta.default.keywords,
    authors: meta.default.authors,
    creator: meta.default.creator,
    publisher: meta.default.publisher,
    applicationName: meta.default.applicationName,
    referrer: meta.default.referrer,
    robots: meta.default.robots,
    openGraph: {
      title: page?.title || meta.default.title,
      description: page?.description || meta.default.description,
      siteName: meta.openGraph.siteName,
      type: meta.openGraph.type,
      locale: meta.openGraph.locale,
      images: meta.openGraph.images,
    },
    twitter: {
      card: meta.twitter.card,
      title: page?.title || meta.twitter.title,
      description: page?.description || meta.twitter.description,
      images: meta.twitter.images,
      creator: meta.twitter.creator,
      site: meta.twitter.site,
    },
  };
};