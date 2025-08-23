'use client';

import { AuthModal, ExportModal } from '@/app/components/modals';
import { ScarcityIndicator } from '@/app/components/public';
import { useAuth, useUserStats } from '@/app/lib/context';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Copy,
  Crown,
  Download,
  Heart,
  RefreshCw,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wand2,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from '@/app/lib/utils';

export default function GeneratePage() {
  const [productName, setProductName] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const userStats = useUserStats();
  const router = useRouter();

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!productName || !niche || !targetAudience) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    try {
      // Mock generation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Ad generated successfully!');
    } catch (error) {
      toast.error('Failed to generate ad. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <ScarcityIndicator />
              {isAuthenticated && userStats && (
                <div className="text-sm text-gray-600">
                  {userStats.generationsUsed || 0} generations used
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Viral Social Media Ads
          </h1>
          <p className="text-xl text-gray-600">
            Create compelling hooks and scripts that drive engagement and conversions
          </p>
        </div>

        {/* Generation Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter your product name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niche *
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select your niche</option>
                <option value="fitness">Fitness & Health</option>
                <option value="beauty">Beauty & Skincare</option>
                <option value="tech">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="fashion">Fashion</option>
                <option value="food">Food & Beverage</option>
                <option value="business">Business</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience *
              </label>
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Describe your target audience (age, interests, demographics, etc.)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Viral Ad'}
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Create Your First Viral Ad?
          </h3>
          <p className="text-gray-600">
            Fill out the form above and click generate to create compelling social media ad content
          </p>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource="nav_signup"
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        content=""
        title=""
      />
    </div>
  );
}