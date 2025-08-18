'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingDown, Clock, Target, AlertTriangle, UserCheck } from 'lucide-react';

interface OnboardingAnalytics {
  completionRate: number;
  averageTimeToComplete: number;
  dropoffPoints: Array<{
    step: string;
    dropoffRate: number;
    usersDropped: number;
  }>;
  stepCompletionRates: Array<{
    step: string;
    completionRate: number;
    averageTime: number;
  }>;
}

interface NudgeCandidate {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  onboardingStep: string;
  engagementScore: number;
}

export default function OnboardingAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<OnboardingAnalytics | null>(null);
  const [nudgeCandidates, setNudgeCandidates] = useState<NudgeCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const [analyticsRes, nudgeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/onboarding/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/onboarding/nudge-candidates`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (nudgeRes.ok) {
        const data = await nudgeRes.json();
        setNudgeCandidates(data);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: string): string => {
    const titles = {
      email_verified: 'Email Verification',
      first_generation: 'First Generation',
      template_explored: 'Template Usage',
      feature_discovered: 'Feature Discovery',
      upgrade_awareness: 'Upgrade Awareness',
    };
    return titles[step as keyof typeof titles] || step;
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatDays = (hours: number) => `${(hours / 24).toFixed(1)}d`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Onboarding Analytics</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="bg-gray-200 h-4 w-24 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-16 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Onboarding Analytics</h2>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercent(analytics.completionRate)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Time to Complete</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDays(analytics.averageTimeToComplete * 24)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Users Need Nudge</p>
                  <p className="text-2xl font-bold text-gray-900">{nudgeCandidates.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Step Completion Rates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step Completion Rates</h3>
            <div className="space-y-4">
              {analytics.stepCompletionRates.map((step) => (
                <div key={step.step} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getStepTitle(step.step)}
                      </span>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatPercent(step.completionRate)}</span>
                        <span className="text-xs">
                          Avg: {step.averageTime < 1 ? '< 1h' : `${Math.round(step.averageTime)}h`}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          step.completionRate >= 70 ? 'bg-green-500' :
                          step.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, step.completionRate)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dropoff Analysis */}
          {analytics.dropoffPoints.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
                Biggest Dropoff Points
              </h3>
              <div className="space-y-3">
                {analytics.dropoffPoints
                  .sort((a, b) => b.dropoffRate - a.dropoffRate)
                  .slice(0, 3)
                  .map((dropoff) => (
                    <div key={dropoff.step} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {getStepTitle(dropoff.step)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {dropoff.usersDropped} users dropped off
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-red-600">
                          {formatPercent(dropoff.dropoffRate)}
                        </span>
                        <p className="text-xs text-gray-500">dropoff rate</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Users Needing Nudge */}
      {nudgeCandidates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-orange-500" />
            Users Needing Engagement ({nudgeCandidates.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">User</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Stuck At</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Engagement Score</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Days Since Signup</th>
                </tr>
              </thead>
              <tbody>
                {nudgeCandidates.slice(0, 10).map((candidate) => {
                  const daysSince = Math.floor(
                    (Date.now() - new Date(candidate.user.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <tr key={candidate.user.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">
                        {candidate.user.email}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {getStepTitle(candidate.onboardingStep)}
                      </td>
                      <td className="py-3 text-sm text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.engagementScore < 20 ? 'bg-red-100 text-red-800' :
                          candidate.engagementScore < 35 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {candidate.engagementScore}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600 text-right">
                        {daysSince}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {nudgeCandidates.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Showing 10 of {nudgeCandidates.length} users needing engagement
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}