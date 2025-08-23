'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ConversionMetrics {
  trialSignups: number;
  trialToPaidConversions: number;
  conversionRate: number;
  averageTrialDuration: number;
  topConversionSources: Array<{
    source: string;
    conversions: number;
    conversionRate: number;
  }>;
  revenueByPlan: Array<{
    plan: string;
    revenue: number;
    subscribers: number;
  }>;
}

interface FunnelStep {
  step: string;
  count: number;
  conversionRate: number;
}

interface AnalyticsDashboardProps {
  period: '24h' | '7d' | '30d' | '90d';
  onPeriodChange: (period: '24h' | '7d' | '30d' | '90d') => void;
}

export default function AnalyticsDashboard({ period, onPeriodChange }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    conversion: ConversionMetrics;
    funnel: FunnelStep[];
  } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="bg-gray-200 h-4 w-24 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-16 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌ {error}</div>
        <button
          onClick={fetchAnalyticsData}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const totalRevenue = data.conversion.revenueByPlan.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalSubscribers = data.conversion.revenueByPlan.reduce((sum, plan) => sum + plan.subscribers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['24h', '7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trial Signups</p>
              <p className="text-2xl font-bold text-gray-900">{data.conversion.trialSignups}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(data.conversion.conversionRate)}</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalSubscribers}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Conversion Funnel
          </h3>
          <div className="space-y-4">
            {data.funnel.map((step, index) => (
              <div key={step.step} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{step.step}</span>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">{step.count.toLocaleString()}</span>
                      {index > 0 && (
                        <span className={`flex items-center ${
                          step.conversionRate >= 50 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {step.conversionRate >= 50 ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                          )}
                          {formatPercent(step.conversionRate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: index === 0 ? '100%' : `${Math.min(100, step.conversionRate)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {data.conversion.revenueByPlan.map((plan) => (
              <div key={plan.plan} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">{plan.plan}</h4>
                  <p className="text-sm text-gray-600">{plan.subscribers} subscribers</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(plan.revenue)}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(plan.subscribers > 0 ? plan.revenue / plan.subscribers : 0)}/user
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Conversion Sources */}
      {data.conversion.topConversionSources.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Conversion Sources</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Source</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Conversions</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.conversion.topConversionSources.map((source) => (
                  <tr key={source.source} className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-900 capitalize">
                      {source.source.replace('_', ' ')}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">{source.conversions}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      {formatPercent(source.conversionRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}