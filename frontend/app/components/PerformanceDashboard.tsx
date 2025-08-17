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

  // Simulate realistic performance data based on timeframe
  const getMetrics = (): MetricData[] => {
    const baseMultiplier = timeframe === '7d' ? 1 : timeframe === '30d' ? 4.3 : 12.8;
    
    return [
      {
        label: 'Total Views',
        value: `${(234 * baseMultiplier).toFixed(0)}K`,
        change: '+12.5%',
        trend: 'up',
        icon: Eye,
        color: 'text-blue-600'
      },
      {
        label: 'Avg. CTR',
        value: '4.2%',
        change: '+0.8%',
        trend: 'up',
        icon: MousePointer,
        color: 'text-green-600'
      },
      {
        label: 'Engagement Rate',
        value: '8.7%',
        change: '+2.1%',
        trend: 'up',
        icon: Users,
        color: 'text-purple-600'
      },
      {
        label: 'Viral Score Avg',
        value: '7.9/10',
        change: '+0.3',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-orange-600'
      }
    ];
  };

  // Generate realistic chart data
  const getChartData = (): ChartData[] => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const data: ChartData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create realistic but fake performance curves
      const baseViews = 15000 + Math.sin(i * 0.2) * 5000 + Math.random() * 3000;
      const baseCTR = 3.8 + Math.sin(i * 0.15) * 0.8 + Math.random() * 0.4;
      const baseConversions = baseViews * (baseCTR / 100) * (0.12 + Math.random() * 0.08);
      
      data.push({
        period: timeframe === '7d' 
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : timeframe === '30d'
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short' }),
        views: Math.round(baseViews),
        ctr: Number(baseCTR.toFixed(1)),
        conversions: Math.round(baseConversions)
      });
    }
    
    return data;
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

        {/* Simple Chart */}
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
      </div>

      {/* Insights & Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performing Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Ads</h3>
          <div className="space-y-4">
            {[
              { hook: "I was skeptical about this fitness routine until...", views: "89K", ctr: "4.8%", niche: "Fitness" },
              { hook: "This skincare hack changed everything...", views: "76K", ctr: "4.2%", niche: "Beauty" },
              { hook: "My productivity went from 0 to 100 with...", views: "64K", ctr: "3.9%", niche: "Productivity" }
            ].map((ad, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 italic">"{ad.hook}"</p>
                  <div className="flex items-center mt-1 space-x-3 text-xs text-gray-600">
                    <span className="bg-gray-200 px-2 py-1 rounded">{ad.niche}</span>
                    <span>{ad.views} views</span>
                    <span className="text-green-600 font-medium">{ad.ctr} CTR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6">
          <div className="flex items-center mb-4">
            <Zap className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Peak Performance Days</p>
                <p className="text-xs text-gray-600">Tuesdays and Thursdays show 23% higher engagement</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Hook Optimization</p>
                <p className="text-xs text-gray-600">Question-based hooks perform 31% better than statements</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Audience Trend</p>
                <p className="text-xs text-gray-600">25-34 age group shows highest conversion rates</p>
              </div>
            </div>
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

      {/* Industry Benchmarks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Industry Benchmarks</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { metric: "Average CTR", your: "4.2%", benchmark: "2.8%", better: true },
            { metric: "Engagement Rate", your: "8.7%", benchmark: "6.1%", better: true },
            { metric: "Conversion Rate", your: "2.1%", benchmark: "3.2%", better: false }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-600 mb-2">{item.metric}</div>
              <div className="flex items-center justify-center space-x-4 mb-2">
                <div className="text-center">
                  <div className={`text-lg font-bold ${item.better ? 'text-green-600' : 'text-orange-600'}`}>
                    {item.your}
                  </div>
                  <div className="text-xs text-gray-500">Your Performance</div>
                </div>
                <div className="text-gray-400">vs</div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">{item.benchmark}</div>
                  <div className="text-xs text-gray-500">Industry Avg</div>
                </div>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.better 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {item.better ? '↗ Above Average' : '↘ Below Average'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}