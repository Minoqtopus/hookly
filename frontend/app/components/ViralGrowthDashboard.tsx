'use client';

import { useEffect, useState } from 'react';
import { ViralGrowthMetrics, ViralGrowthService } from '../lib/viralGrowth';

export default function ViralGrowthDashboard() {
  const [metrics, setMetrics] = useState<ViralGrowthMetrics>({
    shares: 0,
    impressions: 0,
    signups: 0,
    conversionRate: 0,
    viralCoefficient: 0
  });
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<{
    bestTimeToShare: string;
    recommendedPlatforms: string[];
    contentOptimizationTips: string[];
    hashtagStrategy: string[];
  } | null>(null);

  useEffect(() => {
    // Load viral growth data
    const loadViralGrowthData = () => {
      const viralMetrics = ViralGrowthService.getViralGrowthAnalytics();
      const stories = ViralGrowthService.getViralSuccessStories();
      const recs = ViralGrowthService.getViralGrowthRecommendations();

      setMetrics(viralMetrics);
      setSuccessStories(stories);
      setRecommendations(recs);
    };

    loadViralGrowthData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadViralGrowthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getViralCoefficientColor = (coefficient: number) => {
    if (coefficient >= 1.0) return 'text-green-600';
    if (coefficient >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 5.0) return 'text-green-600';
    if (rate >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🚀 Viral Growth Dashboard</h2>
        <p className="text-gray-600">
          Track your content's viral performance and optimize for maximum reach
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{metrics.shares.toLocaleString()}</div>
          <div className="text-sm text-blue-700">Total Shares</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{metrics.impressions.toLocaleString()}</div>
          <div className="text-sm text-green-700">Total Impressions</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{metrics.signups.toLocaleString()}</div>
          <div className="text-sm text-purple-700">Viral Signups</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className={`text-2xl font-bold ${getConversionRateColor(metrics.conversionRate)}`}>
            {metrics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-yellow-700">Conversion Rate</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className={`text-2xl font-bold ${getViralCoefficientColor(metrics.viralCoefficient)}`}>
            {metrics.viralCoefficient.toFixed(2)}
          </div>
          <div className="text-sm text-indigo-700">Viral Coefficient</div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Viral Success Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {successStories.map((story, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900">{story.creator}</div>
                <div className="text-sm text-purple-600 font-medium">{story.platform}</div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-semibold">{story.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shares:</span>
                  <span className="font-semibold">{story.shares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Signups:</span>
                  <span className="font-semibold text-green-600">{story.signups}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 italic">"{story.story}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Viral Growth Recommendations */}
      {recommendations && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Viral Growth Recommendations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📅 Best Time to Share</h4>
              <p className="text-gray-700 mb-3">{recommendations.bestTimeToShare}</p>
              
              <h4 className="font-semibold text-gray-900 mb-3">📱 Recommended Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.recommendedPlatforms.map((platform, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">💡 Content Optimization Tips</h4>
              <ul className="space-y-2 mb-4">
                {recommendations.contentOptimizationTips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
              
              <h4 className="font-semibold text-gray-900 mb-3">🏷️ Hashtag Strategy</h4>
              <ul className="space-y-2">
                {recommendations.hashtagStrategy.map((strategy, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Viral Growth Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 Viral Growth Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Viral Coefficient Analysis</h4>
            <p className="text-sm text-gray-700 mb-3">
              Your viral coefficient of <span className="font-semibold">{metrics.viralCoefficient.toFixed(2)}</span> means that for every share, you're generating{' '}
              <span className="font-semibold">{metrics.viralCoefficient.toFixed(2)}</span> new signups on average.
            </p>
            {metrics.viralCoefficient >= 1.0 && (
              <div className="text-green-700 text-sm font-medium">
                🎉 Excellent! Your content is going viral and driving signups!
              </div>
            )}
            {metrics.viralCoefficient < 1.0 && metrics.viralCoefficient >= 0.5 && (
              <div className="text-yellow-700 text-sm font-medium">
                📈 Good progress! Focus on improving content quality and call-to-actions.
              </div>
            )}
            {metrics.viralCoefficient < 0.5 && (
              <div className="text-red-700 text-sm font-medium">
                🔧 Room for improvement. Review your content strategy and sharing tactics.
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Conversion Optimization</h4>
            <p className="text-sm text-gray-700 mb-3">
              Your viral content is converting at <span className="font-semibold">{metrics.conversionRate.toFixed(1)}%</span>.
              Industry average is 2-5% for viral content.
            </p>
            {metrics.conversionRate >= 5.0 && (
              <div className="text-green-700 text-sm font-medium">
                🚀 Outstanding conversion rate! Your viral strategy is working perfectly.
              </div>
            )}
            {metrics.conversionRate < 5.0 && metrics.conversionRate >= 2.0 && (
              <div className="text-yellow-700 text-sm font-medium">
                📊 Above average! Consider A/B testing different call-to-actions.
              </div>
            )}
            {metrics.conversionRate < 2.0 && (
              <div className="text-red-700 text-sm font-medium">
                💡 Focus on improving your call-to-action and landing page experience.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ready to Create More Viral Content?</h3>
        <p className="text-gray-600 mb-4">
          Use Hookly's AI-powered platform to generate content that goes viral and drives real business results.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 font-medium">
          Create Viral Content Now 🚀
        </button>
      </div>
    </div>
  );
}
