/**
 * Landing Page - Public Route
 * 
 * Staff Engineer Design: Clean, scalable foundation
 * Business Focus: High-converting landing page for viral content platform
 */

import { Metadata } from 'next';

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Create Viral Content
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                That Converts
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Generate high-converting viral content for TikTok, Instagram, and YouTube using AI. 
              Start with 15 free generations and grow your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for creators and businesses who want to compete with big brands
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Generation</h3>
              <p className="text-gray-600">Advanced AI models create content that resonates with your audience</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Prediction</h3>
              <p className="text-gray-600">Know which content will perform before you post it</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Platform Support</h3>
              <p className="text-gray-600">Create content for TikTok, Instagram, YouTube, and more</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Go Viral?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of creators who are already growing their audience
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}