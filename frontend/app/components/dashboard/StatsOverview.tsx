'use client';

import { BarChart3, Target, TrendingUp } from 'lucide-react';
import { UserStats } from '@/app/lib/context';
import { dashboardCopy } from '@/app/lib/copy';

interface StatsOverviewProps {
  stats: UserStats | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  if (!stats) return null;

  const hasUsage = (stats.generationsToday || 0) > 0 || (stats.totalViews || 0) > 0;

  if (!hasUsage) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
        <div className="text-4xl mb-4">{dashboardCopy.stats.emptyState.icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{dashboardCopy.stats.emptyState.title}</h3>
        <p className="text-gray-600">{dashboardCopy.stats.emptyState.subtitle}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Today's Usage */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <Target className="h-8 w-8 text-primary-600" />
          {stats.isTrialUser && stats.monthlyLimit && (
            <span className="text-sm text-gray-500">
              /{stats.monthlyLimit}
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {stats.generationsToday || 0}
        </div>
        <p className="text-gray-600 text-sm">{dashboardCopy.stats.labels.adsCreatedToday}</p>
      </div>

      {/* Total Views */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {stats.totalViews ? 
            stats.totalViews >= 1000000 
              ? `${(stats.totalViews / 1000000).toFixed(1)}M`
              : stats.totalViews >= 1000
              ? `${Math.round(stats.totalViews / 1000)}K`
              : stats.totalViews.toString()
            : '0'
          }
        </div>
        <p className="text-gray-600 text-sm">{dashboardCopy.stats.labels.totalViews}</p>
      </div>

      {/* Avg CTR */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <BarChart3 className="h-8 w-8 text-blue-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {stats.avgCTR || 0}%
        </div>
        <p className="text-gray-600 text-sm">{dashboardCopy.stats.labels.avgCtr}</p>
      </div>
    </div>
  );
}