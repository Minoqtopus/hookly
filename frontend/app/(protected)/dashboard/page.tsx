'use client';

import { 
  StatsOverview,
  RecentWork
} from '@/app/components';
import { UpgradeModal } from '@/app/components/modals';
import { useApp, useAuth, useRecentGenerations, useUserStats } from '@/app/lib/context';
import { dashboardCopy } from '@/app/lib/copy';
import { toast } from '@/app/lib/utils';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [showUpgradeModalState, setShowUpgradeModal] = useState(false);
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const userStats = useUserStats();
  const recentGenerations = useRecentGenerations();
  const { actions } = useApp();

  const handleShowUpgradeModal = () => {
    setShowUpgradeModal(true);
  };

  const handleCopyGeneration = (generation: any) => {
    const textToCopy = `${generation.hook}\n\n${generation.script}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success(dashboardCopy.toasts.copied);
  };

  const handleShareGeneration = (generation: any) => {
    const shareText = `Check out this viral ad hook: "${generation.hook}"`;
    const shareUrl = `${window.location.origin}/shared/${generation.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: generation.title,
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast.success(dashboardCopy.toasts.shareLink);
    }
  };

  const handleToggleFavorite = async (generationId: string) => {
    try {
      await actions.toggleFavorite(generationId);
      toast.success(dashboardCopy.toasts.favoriteUpdated);
    } catch (error) {
      toast.error(dashboardCopy.toasts.favoriteError);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{dashboardCopy.loading.dashboard}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{dashboardCopy.loading.redirecting}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Account Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {dashboardCopy.welcome.title(user.email.split('@')[0])}
          </h1>
          <p className="text-gray-600 mt-1">
            {userStats?.streak ? 
              dashboardCopy.welcome.streak(userStats.streak) :
              dashboardCopy.welcome.noStreak
            }
          </p>
        </div>
        
        {/* Trial Status - Top Right */}
        {userStats?.isTrialUser && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-amber-800 font-medium">
                {dashboardCopy.trial.label} • {dashboardCopy.trial.daysLeft(Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))))}
              </span>
              <button
                onClick={handleShowUpgradeModal}
                className="text-amber-700 hover:text-amber-800 font-medium underline ml-2"
              >
                {dashboardCopy.trial.upgradeButton}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action - Most Important */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">{dashboardCopy.primaryCta.title}</h2>
        <p className="text-primary-100 mb-6 max-w-md mx-auto">
          {dashboardCopy.primaryCta.subtitle}
        </p>
        <Link 
          href="/generate" 
          className="inline-flex items-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg"
        >
          <Sparkles className="h-6 w-6 mr-3" />
          {dashboardCopy.primaryCta.button}
        </Link>
      </div>

      {/* Performance Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{dashboardCopy.stats.sectionTitle}</h2>
        <StatsOverview stats={userStats} />
      </div>
      
      {/* Recent Work */}
      <div>
        <RecentWork
          generations={recentGenerations || []}
          onCopyGeneration={handleCopyGeneration}
          onShareGeneration={handleShareGeneration}
          onToggleFavorite={handleToggleFavorite}
        />
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