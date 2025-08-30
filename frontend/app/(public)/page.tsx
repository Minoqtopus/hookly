/**
 * Landing Page - Public Route
 * 
 * Staff Engineer Design: Clean, scalable foundation
 * Business Focus: High-converting landing page for viral content platform
 */

import { Metadata } from 'next';
import { CTA, Features, Hero } from "@/components/composite";

// ================================
// SEO Metadata
// ================================

export const metadata: Metadata = {
  title: 'Hookly - AI UGC Script Generator for Creators',
  description: 'Generate viral UGC scripts for TikTok & Instagram that build your personal brand and convert viewers into customers. Perfect for individual creators. 5 free scripts to start.',
  keywords: [
    'UGC content generator', 
    'AI UGC scripts', 
    'TikTok content creator', 
    'Instagram UGC creator',
    'personal brand building',
    'creator economy tools',
    'viral UGC generator'
  ],
  openGraph: {
    title: 'Hookly - AI UGC Script Generator for Creators',
    description: 'Generate viral UGC scripts for TikTok & Instagram. Perfect for creators building their personal brand. Get 5 free scripts to start.',
    type: 'website',
    url: 'https://hookly.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hookly - AI UGC Scripts for Creators',
    description: 'Generate viral UGC scripts for TikTok & Instagram. Build your personal brand and convert viewers into customers. 5 free scripts to start.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ================================
// Landing Page Component
// ================================

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}