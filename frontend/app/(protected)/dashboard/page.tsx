'use client';

import BetaBadge from '@/app/components/BetaBadge';
import LocalSavesViewer from '@/app/components/LocalSavesViewer';
import TemplateLibrary from '@/app/components/TemplateLibrary';
import TrialCountdown from '@/app/components/TrialCountdown';
import UpgradeModal from '@/app/components/UpgradeModal';
import ViralGrowthDashboard from '@/app/components/ViralGrowthDashboard';
import ContentMarketingDashboard from '@/app/components/ContentMarketingDashboard';
import { ApiClient } from '@/app/lib/api';
import { useApp, useAuth, useRecentGenerations, useUserStats } from '@/app/lib/AppContext';
import { getPlanConfig } from '@/app/lib/plans';
import { toast } from '@/app/lib/toast';
import { useAnalytics } from '@/app/lib/useAnalytics';
import { routeConfigs, useRouteGuard } from '@/app/lib/useRouteGuard';
import {
  ArrowRight,
  BarChart3,
  Copy,
  Crown,
  Flame,
  Gift,
  Heart,
  LogOut,
  Plus,
  Settings,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [showUpgradeModalState, setShowUpgradeModal] = useState(false);
  const [isQuickAILoading, setIsQuickAILoading] = useState(false);
  const [isDuplicateLoading, setIsDuplicateLoading] = useState(false);
  const router = useRouter();
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const userStats = useUserStats();
  const recentGenerations = useRecentGenerations();
  const { actions } = useApp();
  const { trackPageView, trackInteraction, trackConversionEvent } = useAnalytics();

  // Apply route guard - redirect unauthenticated users to homepage
  useRouteGuard(routeConfigs.dashboard);

  // Track page view
  useEffect(() => {
    if (isAuthenticated && user) {
      trackPageView('dashboard', {
        user_plan: user.plan,
        generations_used: user.trial_generations_used || 0,
        is_beta_user: user.is_beta_user,
      });
    }
  }, [isAuthenticated, user, trackPageView]);

  // Route guard handles authentication redirects - no need for modal

  const handleLogout = () => {
    actions.logout();
  };

  const handleShowUpgradeModal = (source: string) => {
    trackConversionEvent('upgrade_modal_shown', { source });
    setShowUpgradeModal(true);
  };

  const handleUseTemplate = (template: any) => {
    // Store template data and navigate to generate page
    sessionStorage.setItem('selectedTemplate', JSON.stringify({
      productName: template.title,
      niche: template.niche,
      targetAudience: template.targetAudience,
    }));
    router.push('/generate');
  };

  const handleCopyGeneration = (generation: any) => {
    const textToCopy = `${generation.hook}\n\n${generation.script}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Ad content copied to clipboard!');
    
    // Track analytics
    trackInteraction('copy_to_clipboard', {
      generation_id: generation.id,
      content_type: 'generation',
      source: 'dashboard',
    });
  };

  const handleShareGeneration = (generation: any) => {
    const shareText = `Check out this viral ad hook: "${generation.hook}"`;
    const shareUrl = `${window.location.origin}/shared/${generation.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: generation.title,
        text: shareText,
        url: shareUrl,
      }).then(() => {
        // Track successful share
        trackInteraction('share_generation', {
          generation_id: generation.id,
          method: 'native_share',
          source: 'dashboard',
        });
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast.success('Share link copied to clipboard!');
      
      // Track fallback share
      trackInteraction('share_generation', {
        generation_id: generation.id,
        method: 'clipboard_fallback',
        source: 'dashboard',
      });
    }
  };

  const handleToggleFavorite = async (generationId: string) => {
    try {
      const generation = recentGenerations.find(g => g.id === generationId);
      const newFavoriteStatus = !generation?.is_favorite;
      
      await actions.toggleFavorite(generationId);
      toast.success('Favorite updated!');
      
      // Track analytics
      trackInteraction('favorite_toggle', {
        generation_id: generationId,
        is_favorite: newFavoriteStatus,
        source: 'dashboard',
      });
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  // Quick AI - Generate content with default parameters
  const handleQuickAI = async () => {
    if (isQuickAILoading) return;
    
    setIsQuickAILoading(true);
    try {
      // Use default parameters for quick generation
      const quickData = {
        productName: 'Your Amazing Product',
        niche: 'lifestyle',
        targetAudience: 'Young professionals',
      };
      
      const result = await ApiClient.generateAd(quickData);
      
      // Store result in sessionStorage for the generate page
      sessionStorage.setItem('quickAIResult', JSON.stringify(result));
      
      // Redirect to generate page to show result
      router.push('/generate?mode=quick');
      
      toast.success('Quick AI generation complete!');
    } catch (error) {
      console.error('Quick AI error:', error);
      toast.error('Quick AI generation failed. Please try again.');
    } finally {
      setIsQuickAILoading(false);
    }
  };

  // Duplicate - Find best performing generation and pre-fill form
  const handleDuplicate = async () => {
    if (isDuplicateLoading || !recentGenerations?.length) return;
    
    setIsDuplicateLoading(true);
    try {
      // Find the best performing generation by views/CTR
      const bestGeneration = recentGenerations.reduce((best, current) => {
        const bestScore = (best.performance_data?.views || 0) * (best.performance_data?.ctr || 0);
        const currentScore = (current.performance_data?.views || 0) * (current.performance_data?.ctr || 0);
        return currentScore > bestScore ? current : best;
      });
      
      if (bestGeneration) {
        // Store the best generation data for the generate page
        sessionStorage.setItem('duplicateData', JSON.stringify({
          productName: bestGeneration.title || 'Amazing Product',
          niche: bestGeneration.niche || 'lifestyle',
          targetAudience: bestGeneration.target_audience || 'Young professionals',
          hook: bestGeneration.hook,
          script: bestGeneration.script,
        }));
        
        // Redirect to generate page with pre-filled data
        router.push('/generate?mode=duplicate');
        
        toast.success('Best generation loaded for duplication!');
      } else {
        toast.error('No generations found to duplicate');
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('Failed to duplicate generation. Please try again.');
    } finally {
      setIsDuplicateLoading(false);
    }
  };

  // Check if user can duplicate (has generations)
  const canDuplicate = recentGenerations && recentGenerations.length > 0;

  // Use real data - no more hardcoded fallbacks
  const displayGenerations = recentGenerations;
  const displayStats = userStats;

  // Use correct trial limit from backend data
  const trialLimit = displayStats?.isTrialUser ? displayStats.monthlyLimit : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Hookly</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Beta Badge */}
              {user.is_beta_user && (
                <BetaBadge size="small" />
              )}
              
              {/* Plan Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.plan === 'agency'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
                  : user.plan === 'starter' || user.plan === 'pro'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {user.plan === 'agency' ? (
                  <div className="flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    {user.is_beta_user ? 'AGENCY (FREE)' : 'AGENCY'}
                  </div>
                ) : user.plan === 'starter' || user.plan === 'pro' ? (
                  <div className="flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {user.plan === 'starter' ? 'STARTER' : 'PRO'}
                  </div>
                ) : 'TRIAL'}
              </div>
              
              <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </Link>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            {displayStats?.streak ? 
              `Ready to create more viral content? You're on a ${displayStats.streak}-day streak! 🔥` :
              'Ready to start creating viral content? Let\'s build your streak! 💪'
            }
          </p>
        </div>

        {/* Trial Countdown for Trial Users */}
        {displayStats?.isTrialUser && (
          <TrialCountdown
            trialEndsAt={user.trial_ends_at}
            generationsUsed={displayStats.trialGenerationsUsed}
            generationsLimit={displayStats.monthlyLimit || 15}
            onUpgrade={() => handleShowUpgradeModal('trial_countdown')}
            className="mb-8"
          />
        )}

        {/* Performance Overview - Uses real data from backend */}
        {user && (user.plan === 'starter' || user.plan === 'pro' || user.plan === 'agency') && displayStats && (
          <div className="card mb-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Performance Overview</h3>
                <p className="text-gray-600 text-sm">
                  {displayStats.totalViews > 0 ? 'Your ads are gaining traction!' : 'Start generating content to see performance metrics'}
                </p>
              </div>
              <Link 
                href="/analytics" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                View Analytics
              </Link>
            </div>
            {displayStats.totalViews > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-600">
                    {displayStats.totalViews >= 1000000 
                      ? (displayStats.totalViews / 1000000).toFixed(1) + 'M'
                      : displayStats.totalViews >= 1000
                      ? (displayStats.totalViews / 1000).toFixed(0) + 'K' 
                      : displayStats.totalViews}
                  </div>
                  <div className="text-xs text-gray-600">Total Views</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-lg font-bold text-green-600">{displayStats.avgCTR}%</div>
                  <div className="text-xs text-gray-600">Avg CTR</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-600">-</div>
                  <div className="text-xs text-gray-600">Engagement</div>
                  <div className="text-xs text-gray-500">Coming soon</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3">
                  <div className="text-lg font-bold text-orange-600">-</div>
                  <div className="text-xs text-gray-600">Viral Score</div>
                  <div className="text-xs text-gray-500">Coming soon</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg">
                <p className="text-gray-500 mb-4">No performance data yet</p>
                <Link 
                  href="/generate" 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Your First Ad
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Analytics Upsell for Trial Users */}
        {user && user.plan === 'trial' && (
          <div className="card mb-8 bg-gradient-to-br from-gray-50 to-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">📊 Unlock Performance Analytics</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Upgrade to Starter plan for detailed insights, viral trends, and AI-powered recommendations
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>• Industry benchmarks</span>
                    <span>• Competitor analysis</span>
                    <span>• Optimization tips</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleShowUpgradeModal('performance_overview')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usage Today */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Today's Usage</h3>
              <Target className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                {displayStats?.generationsToday ?? 0}
                {trialLimit && displayStats?.isTrialUser && (
                  <span className="text-lg text-gray-500">/{trialLimit}</span>
                )}
              </div>
              {trialLimit && displayStats?.isTrialUser && (
                <div className="ml-3 flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                      style={{ width: `${((displayStats?.generationsToday ?? 0) / trialLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {trialLimit && displayStats?.isTrialUser && (displayStats?.generationsToday ?? 0) >= trialLimit && (
              <p className="text-sm text-red-600 mt-2">
                Trial limit reached! <span className="font-medium cursor-pointer" onClick={() => handleShowUpgradeModal('trial_limit_reached')}>Upgrade to Starter</span>
              </p>
            )}
          </div>

          {/* Streak */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Streak</h3>
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {displayStats?.streak ?? 0} days
            </div>
            <p className="text-sm text-gray-600">
              {(displayStats?.streak ?? 0) > 0 ? 'Keep it up! 🎯' : 'Start your streak! 💪'}
            </p>
          </div>

          {/* Total Views */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Total Views</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {displayStats?.totalViews ? (displayStats.totalViews / 1000000).toFixed(1) + 'M' : '0'}
            </div>
            <p className="text-sm text-gray-600">
              {displayStats?.totalViews ? 'From your generations 📈' : 'Generate content to see views 💡'}
            </p>
          </div>

          {/* Avg CTR */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Avg CTR</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {displayStats?.avgCTR ?? 0}%
            </div>
            <p className="text-sm text-gray-600">
              {displayStats?.avgCTR ? 'Performance metric 🎯' : 'Generate content to track CTR 📊'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Generate New Ad */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Generate</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/generate" className="group p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-700 group-hover:text-primary-700">New Ad</p>
                    <p className="text-sm text-gray-500">From scratch</p>
                  </div>
                </Link>
                
                <button 
                  onClick={handleQuickAI}
                  disabled={isQuickAILoading}
                  className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    {isQuickAILoading ? (
                      <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    ) : (
                      <Zap className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
                    )}
                    <p className="font-medium text-gray-700 group-hover:text-primary-700">
                      {isQuickAILoading ? 'Generating...' : 'Quick AI'}
                    </p>
                    <p className="text-sm text-gray-500">One-click magic</p>
                  </div>
                </button>
                
                {user?.plan === 'agency' ? (
                  <Link href="/teams" className="group p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200">
                    <div className="text-center">
                      <Users className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-700 group-hover:text-primary-700">Teams</p>
                      <p className="text-sm text-gray-500">Collaborate</p>
                    </div>
                  </Link>
                ) : (
                  <button 
                    onClick={handleDuplicate}
                    disabled={!canDuplicate || isDuplicateLoading}
                    className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-center">
                      {isDuplicateLoading ? (
                        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                      ) : (
                        <Copy className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
                      )}
                      <p className="font-medium text-gray-700 group-hover:text-primary-700">
                        {isDuplicateLoading ? 'Duplicating...' : 'Duplicate'}
                      </p>
                      <p className="text-sm text-gray-500">Best performer</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          {user.plan === 'trial' && (
            <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
              <div className="text-center">
                <Crown className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upgrade to Starter</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {getPlanConfig('starter')?.features.slice(0, 3).join(', ') || 'Plan features loading...'}
                </p>
                <button 
                  onClick={() => handleShowUpgradeModal('empty_state_cta')}
                  className="btn-primary w-full text-sm"
                >
                  {getPlanConfig('starter')?.price.monthly ? 
                    `Upgrade Now - $${getPlanConfig('starter')!.price.monthly}/mo` : 
                    'Upgrade Now - Loading...'
                  }
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Cancel anytime • No credit card required for trial
                </p>
              </div>
            </div>
          )}

          {/* Starter/Pro/Agency Bonus */}
          {(user.plan === 'starter' || user.plan === 'pro' || user.plan === 'agency') && (
            <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="text-center">
                <Gift className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pro Bonus! 🎉</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You've unlocked batch generation and advanced analytics
                </p>
                <Link href="/generate?mode=batch" className="btn-primary w-full text-sm">
                  Try Batch Generation
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Template Library */}
        <div className="card mb-8">
          <TemplateLibrary onUseTemplate={handleUseTemplate} compact={true} showFilters={false} />
        </div>

        {/* Local Saves (for unauthenticated users) */}
        {!isAuthenticated && (
          <div className="mb-8">
            <LocalSavesViewer />
          </div>
        )}

        {/* Viral Growth Dashboard */}
        {isAuthenticated && user && ['pro', 'agency'].includes(user.plan) && (
          <div className="mb-8">
            <ViralGrowthDashboard />
          </div>
        )}

        {/* Content Marketing Dashboard */}
        {isAuthenticated && user && user.plan === 'agency' && (
          <div className="mb-8">
            <ContentMarketingDashboard />
          </div>
        )}

        {/* Recent Generations */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Generations</h2>
            <Link href="/history" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View All <ArrowRight className="h-4 w-4 inline ml-1" />
            </Link>
          </div>

          {displayGenerations.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No generations yet</h3>
              <p className="text-gray-600 mb-6">
                Start creating viral ad content to see your generations here!
              </p>
              <Link 
                href="/generate" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Generation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {displayGenerations.map((generation) => (
              <div key={generation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 truncate">{generation.title}</h3>
                  <button 
                    onClick={() => handleToggleFavorite(generation.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${generation.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  "{generation.hook}"
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded">{generation.niche}</span>
                  <span>{generation.created_at}</span>
                </div>
                
                {generation.performance_data && (
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="text-green-600">
                      📈 {generation.performance_data.views ? (generation.performance_data.views / 1000).toFixed(0) + 'K' : '0'} views
                    </div>
                    <div className="text-blue-600">
                      🎯 {generation.performance_data.ctr || 0}% CTR
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleCopyGeneration(generation)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                  <button 
                    onClick={() => handleShareGeneration(generation)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModalState}
        onClose={() => setShowUpgradeModal(false)}
        source="dashboard"
      />

    </div>
  );
}