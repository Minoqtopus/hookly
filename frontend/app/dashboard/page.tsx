'use client';

import AuthModal from '@/app/components/AuthModal';
import LocalSavesViewer from '@/app/components/LocalSavesViewer';
import TemplateLibrary from '@/app/components/TemplateLibrary';
import UpgradeModal from '@/app/components/UpgradeModal';
import { useApp, useAuth, useRecentGenerations, useUserStats } from '@/app/lib/AppContext';
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const userStats = useUserStats();
  const recentGenerations = useRecentGenerations();
  const { actions } = useApp();

  // Apply route guard - redirect unauthenticated users to homepage
  useRouteGuard(routeConfigs.dashboard);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = () => {
    actions.logout();
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

  // Use real data or fallback to mock data
  const displayGenerations = recentGenerations.length > 0 ? recentGenerations : [
    {
      id: '1',
      title: 'Fitness Protein Powder Ad',
      hook: 'I was skeptical about protein powders until...',
      niche: 'Health & Fitness',
      created_at: '2 hours ago',
      is_favorite: true,
      performance_data: { views: 125000, ctr: 4.2 },
      script: '',
      visuals: [],
      target_audience: ''
    },
    {
      id: '2', 
      title: 'Skincare Routine Transformation',
      hook: 'This 3-step routine changed everything...',
      niche: 'Beauty',
      created_at: '1 day ago',
      is_favorite: false,
      performance_data: { views: 89000, ctr: 3.8 },
      script: '',
      visuals: [],
      target_audience: ''
    },
    {
      id: '3',
      title: 'Gaming Setup Essential',
      hook: 'Every gamer needs this secret weapon...',
      niche: 'Gaming',
      created_at: '3 days ago',
      is_favorite: true,
      performance_data: { views: 67000, ctr: 5.1 },
      script: '',
      visuals: [],
      target_audience: ''
    }
  ];

  const displayStats = userStats || {
    generationsToday: user?.plan === 'free' ? 2 : 15,
    totalGenerations: 47,
    totalViews: 2340000,
    avgCTR: 4.2,
    streak: 7
  };

  const dailyLimit = user?.plan === 'free' ? 3 : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return null;

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
              {/* Plan Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.plan === 'pro' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {user.plan === 'pro' ? (
                  <div className="flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    PRO
                  </div>
                ) : 'FREE'}
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
            Ready to create more viral content? You're on a {displayStats.streak}-day streak! 🔥
          </p>
        </div>

        {/* Performance Overview */}
        {user && (user.plan === 'pro' || user.plan === 'agency') && (
          <div className="card mb-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Performance Overview</h3>
                <p className="text-gray-600 text-sm">Your ads are performing above industry average!</p>
              </div>
              <Link 
                href="/analytics" 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                View Analytics
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-white rounded-lg p-3">
                <div className="text-lg font-bold text-blue-600">234K</div>
                <div className="text-xs text-gray-600">Total Views</div>
                <div className="text-xs text-green-600 font-medium">+12.5%</div>
              </div>
              <div className="text-center bg-white rounded-lg p-3">
                <div className="text-lg font-bold text-green-600">4.2%</div>
                <div className="text-xs text-gray-600">Avg CTR</div>
                <div className="text-xs text-green-600 font-medium">+0.8%</div>
              </div>
              <div className="text-center bg-white rounded-lg p-3">
                <div className="text-lg font-bold text-purple-600">8.7%</div>
                <div className="text-xs text-gray-600">Engagement</div>
                <div className="text-xs text-green-600 font-medium">+2.1%</div>
              </div>
              <div className="text-center bg-white rounded-lg p-3">
                <div className="text-lg font-bold text-orange-600">7.9/10</div>
                <div className="text-xs text-gray-600">Viral Score</div>
                <div className="text-xs text-green-600 font-medium">+0.3</div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Upsell for Free Users */}
        {user && user.plan === 'free' && (
          <div className="card mb-8 bg-gradient-to-br from-gray-50 to-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">📊 Unlock Performance Analytics</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    See detailed insights, track viral trends, and get AI-powered recommendations
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>• Industry benchmarks</span>
                    <span>• Competitor analysis</span>
                    <span>• Optimization tips</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(true)}
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
                {displayStats.generationsToday}
                {dailyLimit && (
                  <span className="text-lg text-gray-500">/{dailyLimit}</span>
                )}
              </div>
              {dailyLimit && (
                <div className="ml-3 flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                      style={{ width: `${(displayStats.generationsToday / dailyLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {dailyLimit && displayStats.generationsToday >= dailyLimit && (
              <p className="text-sm text-red-600 mt-2">
                Daily limit reached! <span className="font-medium cursor-pointer" onClick={() => setShowUpgradeModal(true)}>Upgrade to Pro</span>
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
              {displayStats.streak} days
            </div>
            <p className="text-sm text-gray-600">
              Keep it up! 🎯
            </p>
          </div>

          {/* Total Views */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Total Views</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {(displayStats.totalViews / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-green-600">
              +12% this week 📈
            </p>
          </div>

          {/* Avg CTR */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Avg CTR</h3>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {displayStats.avgCTR}%
            </div>
            <p className="text-sm text-blue-600">
              Above industry avg! 🎉
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
                
                <button className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group">
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-700 group-hover:text-primary-700">Quick AI</p>
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
                  <button className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group">
                    <div className="text-center">
                      <Copy className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-700 group-hover:text-primary-700">Duplicate</p>
                      <p className="text-sm text-gray-500">Best performer</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          {user.plan === 'free' && (
            <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
              <div className="text-center">
                <Crown className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upgrade to Pro</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Unlimited generations, advanced analytics, and priority support
                </p>
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="btn-primary w-full text-sm"
                >
                  Upgrade Now - $19/mo
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Cancel anytime • 7-day free trial
                </p>
              </div>
            </div>
          )}

          {/* Pro Bonus */}
          {user.plan === 'pro' && (
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

        {/* Recent Generations */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Generations</h2>
            <Link href="/history" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View All <ArrowRight className="h-4 w-4 inline ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {displayGenerations.map((generation) => (
              <div key={generation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 truncate">{generation.title}</h3>
                  <button className="text-gray-400 hover:text-red-500">
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
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm flex items-center justify-center">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm flex items-center justify-center">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        source="dashboard"
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}