'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Eye, MousePointer, Users, Calendar, BarChart3, Target, Zap, Crown } from 'lucide-react';

interface MetricData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface ChartData {
  period: string;
  views: number;
  ctr: number;
  conversions: number;
}

export default function PerformanceDashboard() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Placeholder for real analytics data - needs backend connection
  const getMetrics = (): MetricData[] => {
    return [
      {
        label: 'Total Views',
        value: 'No data',
        change: '',
        trend: 'neutral',
        icon: Eye,
        color: 'text-blue-600'
      },
      {
        label: 'Avg. CTR',
        value: 'No data',
        change: '',
        trend: 'neutral',
        icon: MousePointer,
        color: 'text-green-600'
      },
      {
        label: 'Engagement Rate',
        value: 'No data',
        change: '',
        trend: 'neutral',
        icon: Users,
        color: 'text-purple-600'
      },
      {
        label: 'Viral Score Avg',
        value: 'No data',
        change: '',
        trend: 'neutral',
        icon: TrendingUp,
        color: 'text-orange-600'
      }
    ];
  };

  // Placeholder for real chart data - needs backend analytics API
  const getChartData = (): ChartData[] => {
    // Return empty data - will be populated from backend
    return [];
  };

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setAnimationCompleted(true), 500);
    return () => clearTimeout(timer);
  }, [timeframe]);

  useEffect(() => {
    setAnimationCompleted(false);
  }, [timeframe]);

  const metrics = getMetrics();
  const chartData = getChartData();
  const maxViews = Math.max(...chartData.map(d => d.views));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">Track your ad performance and optimize for better results</p>
        </div>
        
        {/* Time Frame Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeframe === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${
              animationCompleted ? 'transform-none' : 'transform translate-y-4 opacity-0'
            }`}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              ...(animationCompleted && { transform: 'none', opacity: 1 })
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className={`h-8 w-8 ${metric.color}`} />
              <div className={`flex items-center text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                {metric.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Views & Engagement Trends</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Views
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              CTR %
            </div>
          </div>
        </div>

        {/* Chart Data Placeholder */}
        {chartData.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No analytics data available</p>
            <p className="text-sm text-gray-400">Generate content to see performance trends</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={data.period} className="flex items-center space-x-4">
                <div className="w-16 text-xs text-gray-600 font-medium">
                  {data.period}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  {/* Views Bar */}
                  <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: animationCompleted ? `${(data.views / maxViews) * 100}%` : '0%',
                        transitionDelay: `${index * 50}ms`
                      }}
                    ></div>
                  </div>
                  
                  {/* CTR Indicator */}
                  <div className="w-12 text-right">
                    <span className="text-xs font-medium text-green-600">
                      {data.ctr}%
                    </span>
                  </div>
                </div>
                <div className="w-20 text-right text-xs text-gray-600">
                  {(data.views / 1000).toFixed(1)}K
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights & Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performing Content - Placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Ads</h3>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No performance data yet</p>
            <p className="text-sm text-gray-400">Generate ads to see top performers</p>
          </div>
        </div>

        {/* AI Insights - Placeholder */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6">
          <div className="flex items-center mb-4">
            <Zap className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
          </div>
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-primary-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No insights available yet</p>
            <p className="text-sm text-gray-400">AI insights will appear after generating content</p>
          </div>
          
          {/* Pro Feature Tease */}
          <div className="mt-6 pt-4 border-t border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-4 w-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Advanced Analytics</span>
              </div>
              <button className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full font-medium hover:bg-primary-700 transition-colors">
                Upgrade Pro
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Get competitor analysis, A/B testing, and custom reports
            </p>
          </div>
        </div>
      </div>

      {/* Industry Benchmarks - Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Industry Benchmarks</h3>
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Benchmarks coming soon</p>
          <p className="text-sm text-gray-400">Industry comparison data will be available once you have performance metrics</p>
        </div>
      </div>
    </div>
  );
}