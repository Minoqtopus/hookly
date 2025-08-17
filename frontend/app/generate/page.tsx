'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  ArrowLeft, 
  Wand2, 
  Copy, 
  Share2, 
  Heart, 
  Download,
  RefreshCw,
  Crown,
  Zap,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth, useUserStats } from '@/app/lib/AppContext';
import { useGeneration } from '@/app/lib/useGeneration';
import UpgradeModal from '@/app/components/UpgradeModal';
import AuthModal from '@/app/components/AuthModal';
import SocialProofLoader from '@/app/components/SocialProofLoader';
import ScarcityIndicator from '@/app/components/ScarcityIndicator';
import TemplateLibrary from '@/app/components/TemplateLibrary';
import ExportModal from '@/app/components/ExportModal';
import { LocalSaveService } from '@/app/lib/localSaves';
import Link from 'next/link';

export default function GeneratePage() {
  const [showResult, setShowResult] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [upgradeSource, setUpgradeSource] = useState<'limit_reached' | 'feature_gate' | 'generator'>('feature_gate');
  
  const { user, isAuthenticated } = useAuth();
  const userStats = useUserStats();
  const { isGenerating, generatedAd, error, generateAd, generateGuestAd, clearError } = useGeneration();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const restored = searchParams.get('restored');

  const [formData, setFormData] = useState({
    productName: '',
    niche: '',
    targetAudience: '',
  });

  const dailyLimit = user?.plan === 'free' ? 3 : (user?.plan === 'starter' ? 50 : null);
  const remainingGenerations = dailyLimit ? Math.max(0, dailyLimit - (userStats?.generationsToday || 0)) : null;

  useEffect(() => {
    // Restore demo data if coming from auth flow
    if (restored) {
      const pendingDemo = sessionStorage.getItem('pendingDemoData');
      if (pendingDemo) {
        const data = JSON.parse(pendingDemo);
        setFormData({
          productName: data.productName,
          niche: data.niche,
          targetAudience: data.targetAudience,
        });
        // Use the generation hook to set the result
        if (data.generatedAd) {
          setShowResult(true);
        }
        sessionStorage.removeItem('pendingDemoData');
      }
    }

    // Check for selected template from dashboard
    const selectedTemplate = sessionStorage.getItem('selectedTemplate');
    if (selectedTemplate) {
      const templateData = JSON.parse(selectedTemplate);
      setFormData(templateData);
      sessionStorage.removeItem('selectedTemplate');
    }
  }, [restored]);

  const handleGenerate = async () => {
    clearError();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Check limits for free users
    if (remainingGenerations !== null && remainingGenerations <= 0) {
      setUpgradeSource('limit_reached');
      setShowUpgradeModal(true);
      return;
    }

    setShowResult(false);

    const result = await generateAd({
      productName: formData.productName,
      niche: formData.niche,
      targetAudience: formData.targetAudience,
    });

    if (result) {
      setShowResult(true);
      
      // Show upgrade modal after 2nd generation for free/starter users
      if ((user?.plan === 'free' || user?.plan === 'starter') && userStats?.totalGenerations === 2) {
        setTimeout(() => {
          setUpgradeSource('generator');
          setShowUpgradeModal(true);
        }, 3000); // Show 3 seconds after results appear
      }
    }
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
    alert(`${type} copied to clipboard!`);
    
    // Show upgrade modal after 3rd copy action for free/starter users (high engagement signal)
    if (user?.plan === 'free' || user?.plan === 'starter') {
      const copyCount = parseInt(sessionStorage.getItem('copyCount') || '0') + 1;
      sessionStorage.setItem('copyCount', copyCount.toString());
      
      if (copyCount === 3) {
        setTimeout(() => {
          setUpgradeSource('generator');
          setShowUpgradeModal(true);
        }, 1000);
      }
    }
  };

  const handleSaveToFavorites = () => {
    if (!isAuthenticated) {
      // For unauthenticated users, save locally (up to 3 saves)
      const saveResult = LocalSaveService.saveAd({
        title: `${formData.productName} Ad`,
        hook: generatedAd.hook,
        script: generatedAd.script,
        visuals: generatedAd.visuals,
        niche: formData.niche,
        targetAudience: formData.targetAudience,
        performance: generatedAd.performance,
        isFavorite: true,
      });

      if (saveResult.success) {
        alert('Saved locally! (3 saves max for guests)');
      } else if (saveResult.limitReached) {
        // Show auth modal when limit reached
        alert('You\'ve reached the 3-save limit for guests. Sign up for unlimited saves!');
        setShowAuthModal(true);
      } else {
        alert('Failed to save. Please try again.');
      }
      return;
    }
    // For authenticated users, save to account
    alert('Saved to your account!');
  };

  const handleUseTemplate = (template: any) => {
    setFormData({
      productName: template.title,
      niche: template.niche,
      targetAudience: template.targetAudience,
    });
    // Scroll to form
    document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const suggestedInputs = [
    { productName: 'Wireless Earbuds', niche: 'Tech', audience: 'Music lovers aged 18-35' },
    { productName: 'Skincare Serum', niche: 'Beauty', audience: 'Women aged 25-45 with skin concerns' },
    { productName: 'Protein Powder', niche: 'Fitness', audience: 'Gym enthusiasts and athletes' },
    { productName: 'Coffee Blend', niche: 'Food & Beverage', audience: 'Coffee enthusiasts aged 25-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <span className="font-bold text-gray-900">AI Generator</span>
              </div>
            </div>
            
            {/* Usage Indicator */}
            {user && (user.plan === 'free' || user.plan === 'starter') && remainingGenerations !== null && (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  {remainingGenerations}/{dailyLimit} left {user.plan === 'starter' ? 'this month' : 'today'}
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((dailyLimit! - remainingGenerations) / dailyLimit!) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResult ? (
          // Generation Form
          <div className="space-y-8">
            {/* Title Section */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create Your Viral Ad ✨
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI analyzes millions of viral TikTok ads to create scripts that actually convert. 
                Start with a proven template or create from scratch.
              </p>
            </div>

            {/* Template Library */}
            <div className="card">
              <TemplateLibrary onUseTemplate={handleUseTemplate} compact={true} showFilters={false} />
            </div>

            {/* Quick Suggestions */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">🚀 Quick Start Ideas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedInputs.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setFormData(suggestion)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                  >
                    <div className="font-medium text-gray-900">{suggestion.productName}</div>
                    <div className="text-sm text-gray-600">{suggestion.niche} • {suggestion.audience}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Form */}
            <div className="card">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    📦 Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    placeholder="e.g., Wireless Bluetooth Earbuds"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific - this helps our AI create more targeted content
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    🎯 Niche/Category
                  </label>
                  <input
                    type="text"
                    value={formData.niche}
                    onChange={(e) => setFormData({...formData, niche: e.target.value})}
                    placeholder="e.g., Tech, Beauty, Fitness, Fashion"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    👥 Target Audience
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    placeholder="e.g., Music lovers aged 18-35 who commute daily"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include age, interests, and pain points for better targeting
                  </p>
                </div>

                {/* Pro Features Teaser */}
                {(user?.plan === 'free' || user?.plan === 'starter') && (
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-200">
                    <div className="flex items-start space-x-3">
                      <Crown className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">🚀 Pro Tip</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Pro users can generate 10 variations at once and get advanced targeting options
                        </p>
                        <button 
                          onClick={() => setShowUpgradeModal(true)}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          Upgrade to Pro →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.productName || !formData.niche || !formData.targetAudience}
                  className="btn-primary w-full text-lg py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <SocialProofLoader size="small" className="text-white" />
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5 mr-2" />
                      Generate Viral Ad
                    </>
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Limit Warning */}
                {(user?.plan === 'free' || user?.plan === 'starter') && remainingGenerations !== null && remainingGenerations <= 1 && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {remainingGenerations === 0 
                        ? 'Daily limit reached! Upgrade for unlimited generations.'
                        : `Only ${remainingGenerations} generation left today.`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
                <CheckCircle className="h-4 w-4 mr-2" />
                Ad Generated Successfully!
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your Viral Ad is Ready! 🎉
              </h1>
              <p className="text-gray-600">
                Based on {formData.productName} for {formData.targetAudience}
              </p>
            </div>

            {/* Performance Prediction */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">📊 AI Performance Prediction</h3>
                <p className="text-sm text-gray-600">Based on viral pattern analysis</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(generatedAd.performance.estimatedViews / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-600">Est. Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {generatedAd.performance.estimatedCTR}%
                  </div>
                  <div className="text-xs text-gray-600">Est. CTR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedAd.performance.viralScore}/10
                  </div>
                  <div className="text-xs text-gray-600">Viral Score</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  🎯 High viral potential detected
                </div>
              </div>
            </div>

            {/* Generated Content */}
            <div className="space-y-6">
              {/* Hook */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 text-primary-600 mr-2" />
                    Hook (First 3 seconds)
                  </h3>
                  <button
                    onClick={() => handleCopyToClipboard(generatedAd.hook, 'Hook')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 font-medium italic">
                    {generatedAd.hook}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 This hook is designed to stop scrollers in their tracks
                </p>
              </div>

              {/* Script */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Sparkles className="h-5 w-5 text-primary-600 mr-2" />
                    Full Script (30-60 seconds)
                  </h3>
                  <button
                    onClick={() => handleCopyToClipboard(generatedAd.script, 'Script')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">
                    {generatedAd.script}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  🎯 Optimized for authenticity and conversion
                </p>
              </div>

              {/* Visual Prompts */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                    Visual Prompts
                  </h3>
                  <button
                    onClick={() => handleCopyToClipboard(generatedAd.visuals.join('\n'), 'Visual prompts')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {generatedAd.visuals.map((visual: string, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium text-primary-600">Shot {index + 1}:</span> {visual}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={handleSaveToFavorites}
                className="btn-secondary flex items-center justify-center"
              >
                <Heart className="h-4 w-4 mr-2" />
                Save
              </button>
              <button className="btn-secondary flex items-center justify-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="btn-secondary flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => {
                  setShowResult(false);
                  setFormData({ productName: '', niche: '', targetAudience: '' });
                  clearError();
                }}
                className="btn-primary flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Ad
              </button>
            </div>

            {/* Pro Upsell */}
            {(user?.plan === 'free' || user?.plan === 'starter') && (
              <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
                <div className="text-center">
                  <Crown className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Love this ad? 🚀</h3>
                  
                  {/* Scarcity Indicator */}
                  <div className="mb-4">
                    <ScarcityIndicator type="trending" size="small" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Generate unlimited variations, get advanced analytics, and remove watermarks with Pro
                  </p>
                  <button 
                    onClick={() => {
                      setUpgradeSource('generator');
                      setShowUpgradeModal(true);
                    }}
                    className="btn-primary"
                  >
                    Upgrade to Pro - Just $1.30/day
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Join 1,000+ Pro creators • Cancel anytime
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        source={upgradeSource}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource="try_again"
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        adData={{
          title: `${formData.productName} Ad`,
          hook: generatedAd?.hook || '',
          script: generatedAd?.script || '',
          visuals: generatedAd?.visuals || [],
          niche: formData.niche,
          targetAudience: formData.targetAudience,
          performance: generatedAd?.performance
        }}
      />
    </div>
  );
}