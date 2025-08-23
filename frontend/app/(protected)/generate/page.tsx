'use client';

import { AuthModal } from '@/app/components/modals';
import ExportModal from '@/app/components/ExportModal';
import { ScarcityIndicator } from '@/app/components/public';
import SocialProofLoader from '@/app/components/SocialProofLoader';
import TemplateLibrary from '@/app/components/TemplateLibrary';
import UpgradeModal from '@/app/components/UpgradeModal';
import VariationsGenerator from '@/app/components/VariationsGenerator';
import { useAuth, useUserStats } from '@/app/lib/context';
import { AuthService } from '@/app/lib/auth';
import { LocalSaveService } from '@/app/lib/localSaves';
import { getPlanConfig, getTrialLimit } from '@/app/lib/plans';
import { useDemoOptimization } from '@/app/lib/useDemoOptimization';
import { useGeneration } from '@/app/lib/useGeneration';
import { routeConfigs, useRouteGuard } from '@/app/lib/useRouteGuard';
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
  Wand2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from '../lib/toast';

function GeneratePageContent() {
  const [showResult, setShowResult] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [upgradeSource, setUpgradeSource] = useState<'dashboard' | 'limit_reached' | 'feature_gate' | 'nav'>('feature_gate');
  
  const { user, isAuthenticated } = useAuth();
  const userStats = useUserStats();
  const { isGenerating, generatedAd, error, generateAd, generateGuestAd, clearError } = useGeneration();
  const demoOptimization = useDemoOptimization();
  
  // Apply route guard - allow both authenticated and unauthenticated users
  useRouteGuard(routeConfigs.generate);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const restored = searchParams.get('restored');
  const isDemoMode = searchParams.get('demo') === 'true';

  const [formData, setFormData] = useState({
    productName: '',
    niche: '',
    targetAudience: '',
  });

  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [shareTitle, setShareTitle] = useState('');
  const [shareNotes, setShareNotes] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // Get monthly limits from centralized configuration
  const getMonthlyLimit = (planType: string) => {
    if (planType === 'trial') return getTrialLimit();
    const config = getPlanConfig(planType);
    return config?.generationsPerMonth || null;
  };
  
  const monthlyLimit = user?.plan ? getMonthlyLimit(user.plan) : null;
  const remainingGenerations = monthlyLimit ? Math.max(0, monthlyLimit - (userStats?.generationsThisMonth || 0)) : null;

  useEffect(() => {
    // Demo mode - no timer needed anymore

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

    // Load demo data if available
    const demoData = sessionStorage.getItem('demo_data');
    if (demoData && isDemoMode) {
      const data = JSON.parse(demoData);
      setFormData({
        productName: data.productName,
        niche: data.niche,
        targetAudience: data.targetAudience,
      });
      sessionStorage.removeItem('demo_data');
    }
  }, [restored, isDemoMode, searchParams]);

  // Smart signup triggers based on user engagement
  useEffect(() => {
    // Only show signup triggers when in demo mode and user has engaged
    if (demoOptimization.shouldShowSignup && !showUpgradeModal && !showAuthModal && isDemoMode) {
      // Show auth modal for signup instead of upgrade
      setShowAuthModal(true);
    }
  }, [demoOptimization.shouldShowSignup, showUpgradeModal, showAuthModal, isDemoMode]);

  // Track generation for smart triggers
  useEffect(() => {
    if (generatedAd && isDemoMode) {
      demoOptimization.trackGeneration();
    }
  }, [generatedAd, isDemoMode, demoOptimization]);

  // Handle auth modal close to prevent reopening
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Reset the demo optimization state to prevent modal from reopening
    if (demoOptimization.shouldShowSignup) {
      // This will prevent the modal from reopening immediately
      sessionStorage.setItem('demo_signup_shown', 'true');
    }
  };

  useEffect(() => {
    // Load teams when share modal is opened
    if (showShareModal && user?.plan === 'agency') {
      loadUserTeams();
    }
  }, [showShareModal, user?.plan]);

  // Demo handlers removed - no longer needed for trial-first model

  const handleGenerate = async () => {
    clearError();
    
    // For demo mode, use guest generation
    if (isDemoMode && !isAuthenticated) {
      setShowResult(false);
      
      const result = await generateGuestAd({
        productName: formData.productName,
        niche: formData.niche,
        targetAudience: formData.targetAudience,
      });

      if (result) {
        setShowResult(true);
      }
      return;
    }
    
    // Check if user is authenticated for non-demo mode
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
      
      // Show upgrade modal after 2nd generation for trial users
      if (user?.plan === 'trial' && userStats?.totalGenerations === 2) {
        setTimeout(() => {
          setUpgradeSource('feature_gate');
          setShowUpgradeModal(true);
        }, 3000); // Show 3 seconds after results appear
      }
    }
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
    toast.success(`${type} copied to clipboard!`);
    
    // Show upgrade modal after 3rd copy action for trial users (high engagement signal)
    if (user?.plan === 'trial') {
      const copyCount = parseInt(sessionStorage.getItem('copyCount') || '0') + 1;
      sessionStorage.setItem('copyCount', copyCount.toString());
      
      if (copyCount === 3) {
        setTimeout(() => {
          setUpgradeSource('feature_gate');
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
        hook: generatedAd?.hook || '',
        script: generatedAd?.script || '',
        visuals: generatedAd?.visuals || [],
        niche: formData.niche,
        targetAudience: formData.targetAudience,
        performance: generatedAd?.performance || { estimatedViews: 0, estimatedCTR: 0, viralScore: 0 },
        isFavorite: true,
      });

      if (saveResult.success) {
        toast.success('Saved locally! (3 saves max for guests)');
      } else if (saveResult.limitReached) {
        // Show auth modal when limit reached
        toast.info('You\'ve reached the 3-save limit for guests. Sign up for unlimited saves!');
        setShowAuthModal(true);
      } else {
        toast.error('Failed to save. Please try again.');
      }
      return;
    }
    // For authenticated users, save to account
    toast.success('Saved to your account!');
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

  const loadUserTeams = async () => {
    if (user?.plan !== 'agency') return;
    
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens) return;

      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserTeams(data.teams);
        if (data.teams.length > 0) {
          setSelectedTeamId(data.teams[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleShareWithTeam = async () => {
    if (!selectedTeamId || !generatedAd) return;
    
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens) return;

      const response = await fetch(`/api/teams/${selectedTeamId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({
          generationId: generatedAd.id, // We'll need to get this from the generation response
          title: shareTitle || `${formData.productName} Ad`,
          notes: shareNotes,
        }),
      });

      if (response.ok) {
        toast.success('Ad shared with team successfully!');
        setShowShareModal(false);
        setShareTitle('');
        setShareNotes('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to share with team');
      }
    } catch (error) {
      toast.error('Failed to share with team');
    }
  };

  const suggestedInputs = [
    { productName: 'Wireless Earbuds', niche: 'Tech', targetAudience: 'Music lovers aged 18-35' },
    { productName: 'Skincare Serum', niche: 'Beauty', targetAudience: 'Women aged 25-45 with skin concerns' },
    { productName: 'Protein Powder', niche: 'Fitness', targetAudience: 'Gym enthusiasts and athletes' },
    { productName: 'Coffee Blend', niche: 'Food & Beverage', targetAudience: 'Coffee enthusiasts aged 25-50' },
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
            {user && user.plan === 'trial' && remainingGenerations !== null && (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  {remainingGenerations}/{monthlyLimit} left this trial
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((monthlyLimit! - remainingGenerations!) / monthlyLimit!) * 100}%` }}
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
              {isDemoMode && (
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Demo Mode - See what Hookly can create for you!
                  </span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create Your Viral Ad ✨
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI analyzes millions of viral TikTok ads to create scripts that actually convert. 
                {isDemoMode 
                  ? " Try it now - no signup required for this demo!"
                  : " Start with a proven template or create from scratch."
                }
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
                    <div className="text-sm text-gray-600">{suggestion.niche} • {suggestion.targetAudience}</div>
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
                {user?.plan === 'trial' && (
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
                {user?.plan === 'trial' && remainingGenerations !== null && remainingGenerations <= 1 && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {remainingGenerations === 0 
                        ? 'Trial limit reached! Upgrade for more generations.'
                        : `Only ${remainingGenerations} generation left in trial.`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Variations Generator Section */}
            {user?.has_batch_generation && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">🚀 Pro Feature: Batch Variations</h3>
                    <p className="text-sm text-gray-600">Generate 3 different approaches in one click</p>
                  </div>
                  <button
                    onClick={() => setShowVariations(!showVariations)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    {showVariations ? 'Hide Variations' : 'Generate 3 Variations'}
                  </button>
                </div>
                
                {showVariations && (
                  <VariationsGenerator
                    formData={formData}
                    onUpgrade={() => setShowUpgradeModal(true)}
                    onSave={() => {
                      // Handle save variation
                      toast.success('Variation saved!');
                    }}
                    onExport={() => {
                      // Handle export variation
                      setShowExportModal(true);
                    }}
                  />
                )}
              </div>
            )}
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
                    {((generatedAd?.performance?.estimatedViews || 0) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-600">Est. Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {generatedAd?.performance?.estimatedCTR || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Est. CTR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedAd?.performance?.viralScore || 0}/10
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
                    onClick={() => handleCopyToClipboard(generatedAd?.hook || '', 'Hook')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 font-medium italic">
                    {generatedAd?.hook || ''}
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
                    onClick={() => handleCopyToClipboard(generatedAd?.script || '', 'Script')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">
                    {generatedAd?.script || ''}
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
                    onClick={() => handleCopyToClipboard((generatedAd?.visuals || []).join('\n'), 'Visual prompts')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {(generatedAd?.visuals || []).map((visual: string, index: number) => (
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
              <button 
                onClick={() => setShowShareModal(true)}
                className="btn-secondary flex items-center justify-center"
              >
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

            {/* Demo to Trial Conversion */}
            {isDemoMode && !isAuthenticated && (
              <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Amazing! Your ad looks great!</h3>
                  <p className="text-gray-600 mb-4">
                    Want to save this ad and create 3 more with your free trial?
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Free Trial Includes:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✅ Save this ad to your account</li>
                      <li>✅ Generate 3 more ads (7-day trial)</li>
                      <li>✅ Access to all templates</li>
                      <li>✅ No credit card required</li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="btn-primary text-lg px-8 py-3 mb-3"
                  >
                    Save Ad + Start Free Trial
                  </button>
                  <p className="text-xs text-gray-500">
                    Takes 30 seconds • No spam, we promise
                  </p>
                </div>
              </div>
            )}

            {/* Pro Upsell */}
            {(user?.plan === 'trial' || user?.plan === 'starter') && (
              <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
                <div className="text-center">
                  <Crown className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Love this ad? 🚀</h3>
                  
                  {/* Scarcity Indicator */}
                  <div className="mb-4">
                    <ScarcityIndicator type="trending" size="small" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Generate 200 variations per month, get advanced analytics, and remove watermarks with Pro
                  </p>
                  <button 
                    onClick={() => {
                      setUpgradeSource('feature_gate');
                      setShowUpgradeModal(true);
                    }}
                    className="btn-primary"
                  >
                    Upgrade to Pro - Just $1.30/day
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Join 1,000+ Pro users • Cancel anytime
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
        onClose={handleAuthModalClose}
        triggerSource="try_again"
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        content={{
          hook: generatedAd?.hook || '',
          script: generatedAd?.script || '',
          visualDescription: generatedAd?.visuals?.join(', ') || '',
          callToAction: `Check out this amazing ${formData.niche} content!`,
          platformOptimization: `Optimized for ${formData.targetAudience} in the ${formData.niche} niche`
        }}
      />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Ad</h3>
            
            {user?.plan === 'agency' && userTeams.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share with Team
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="input-field"
                  >
                    {userTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder={`${formData.productName} Ad`}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={shareNotes}
                    onChange={(e) => setShareNotes(e.target.value)}
                    placeholder="Add notes about this ad for your team..."
                    className="input-field"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleShareWithTeam}
                    className="btn-primary flex-1"
                  >
                    Share with Team
                  </button>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                {user?.plan !== 'agency' ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      Team sharing is available with Agency plan
                    </p>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setShowUpgradeModal(true);
                      }}
                      className="btn-primary"
                    >
                      Upgrade to Agency
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      You don't have any teams yet. Create a team first to share ads.
                    </p>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        router.push('/teams');
                      }}
                      className="btn-primary"
                    >
                      Create Team
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowShareModal(false)}
                  className="btn-secondary mt-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  );
}