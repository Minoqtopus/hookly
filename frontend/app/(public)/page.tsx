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
  title: 'Viral Content Generator - Create Viral Social Media Content with AI',
  description: 'Generate high-converting viral content for TikTok, Instagram, and YouTube. AI-powered social media content creation platform with 15 free generations.',
  keywords: [
    'viral content generator', 
    'AI social media', 
    'TikTok content creator', 
    'Instagram viral posts',
    'YouTube content ideas',
    'social media automation',
    'viral marketing tool'
  ],
  openGraph: {
    title: 'Viral Content Generator - AI-Powered Social Media Content',
    description: 'Create viral social media content that converts. Get 15 free generations and start growing your audience today.',
    type: 'website',
    url: 'https://viralcontentgenerator.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viral Content Generator - AI Social Media Tool',
    description: 'Generate viral content for TikTok, Instagram & YouTube. 15 free generations to start.',
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