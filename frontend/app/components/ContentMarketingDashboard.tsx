'use client';

import {
    BarChart3,
    Crown,
    DollarSign,
    FileText,
    Link as LinkIcon,
    Mail,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AffiliateLink, ContentMarketingMetrics, ContentMarketingService, SponsoredContent } from '../lib/contentMarketing';

export default function ContentMarketingDashboard() {
  const [metrics, setMetrics] = useState<ContentMarketingMetrics>({
    newsletter_revenue: 0,
    blog_revenue: 0,
    affiliate_revenue: 0,
    sponsored_content_revenue: 0,
    total_revenue: 0,
    newsletter_subscribers: 0,
    blog_views: 0,
    conversion_rate: 0
  });
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [sponsoredContent, setSponsoredContent] = useState<SponsoredContent[]>([]);
  const [roi, setROI] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>({});

  useEffect(() => {
    // Load content marketing data
    const loadContentMarketingData = () => {
      const contentMetrics = ContentMarketingService.getContentMarketingMetrics();
      const affiliateData = ContentMarketingService.getAffiliateLinks();
      const sponsoredData = ContentMarketingService.getSponsoredContent();
      const roiData = ContentMarketingService.calculateROI();
      const recommendationData = ContentMarketingService.getContentMarketingRecommendations();

      setMetrics(contentMetrics);
      setAffiliateLinks(affiliateData);
      setSponsoredContent(sponsoredData);
      setROI(roiData);
      setRecommendations(recommendationData);
    };

    loadContentMarketingData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadContentMarketingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRevenueColor = (amount: number) => {
    if (amount >= 10000) return 'text-green-600';
    if (amount >= 5000) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getROIColor = (roi: number) => {
    if (roi >= 200) return 'text-green-600';
    if (roi >= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 7) return 'text-green-600';
    if (rate >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">💰 Content Marketing Dashboard</h2>
        <p className="text-gray-600">
          Track newsletter, blog, affiliate, and sponsored content revenue streams
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-blue-700">Newsletter</span>
          </div>
          <div className={`text-2xl font-bold ${getRevenueColor(metrics.newsletter_revenue)}`}>
            ${metrics.newsletter_revenue.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700">Monthly Revenue</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-xs text-green-700">Blog</span>
          </div>
          <div className={`text-2xl font-bold ${getRevenueColor(metrics.blog_revenue)}`}>
            ${metrics.blog_revenue.toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Monthly Revenue</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <LinkIcon className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-700">Affiliate</span>
          </div>
          <div className={`text-2xl font-bold ${getRevenueColor(metrics.affiliate_revenue)}`}>
            ${metrics.affiliate_revenue.toLocaleString()}
          </div>
          <div className="text-sm text-purple-700">Monthly Revenue</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            <span className="text-xs text-yellow-700">Sponsored</span>
          </div>
          <div className={`text-2xl font-bold ${getRevenueColor(metrics.sponsored_content_revenue)}`}>
            ${metrics.sponsored_content_revenue.toLocaleString()}
          </div>
          <div className="text-sm text-yellow-700">Monthly Revenue</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span className="text-xs text-indigo-700">Total</span>
          </div>
          <div className={`text-2xl font-bold ${getRevenueColor(metrics.total_revenue)}`}>
            ${metrics.total_revenue.toLocaleString()}
          </div>
          <div className="text-sm text-indigo-700">Monthly Revenue</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-gray-600">ROI</span>
          </div>
          <div className={`text-2xl font-bold ${getROIColor(roi.monthly_roi || 0)}`}>
            {(roi.monthly_roi || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Monthly ROI</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="text-xs text-gray-600">CPA</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${(roi.cost_per_acquisition || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Cost per Acquisition</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-gray-600">LTV</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            ${(roi.lifetime_value || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Lifetime Value</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span className="text-xs text-gray-600">Margin</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {(roi.profit_margin || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Profit Margin</div>
        </div>
      </div>

      {/* Affiliate Links Performance */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Top Affiliate Links</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            {affiliateLinks.slice(0, 3).map((link) => (
              <div key={link.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{link.product_name}</h4>
                  <div className="text-sm text-gray-500">
                    {link.commission_rate}% commission
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Clicks</div>
                    <div className="font-semibold">{link.clicks.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Conversions</div>
                    <div className="font-semibold text-green-600">{link.conversions}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Conv. Rate</div>
                    <div className={`font-semibold ${getConversionRateColor((link.conversions / link.clicks) * 100)}`}>
                      {((link.conversions / link.clicks) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Revenue</div>
                    <div className="font-semibold text-green-600">${link.revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsored Content */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👑 Sponsored Content</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            {sponsoredContent.slice(0, 3).map((content) => (
              <div key={content.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <img 
                      src={content.sponsor_logo} 
                      alt={content.sponsor_name}
                      className="w-8 h-8 mr-3 rounded"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{content.title}</h4>
                      <p className="text-sm text-gray-600">{content.sponsor_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${content.price.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      content.status === 'published' ? 'bg-green-100 text-green-800' :
                      content.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {content.status}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Views</div>
                    <div className="font-semibold">{content.metrics.views.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Clicks</div>
                    <div className="font-semibold">{content.metrics.clicks.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Engagement</div>
                    <div className="font-semibold">{content.metrics.engagement_rate}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Optimization Recommendations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">📧 Newsletter Optimization</h4>
            <ul className="space-y-2">
              {recommendations.newsletter_optimization?.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="text-sm text-blue-800 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">📝 Blog Optimization</h4>
            <ul className="space-y-2">
              {recommendations.blog_optimization?.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="text-sm text-green-800 flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">🔗 Affiliate Optimization</h4>
            <ul className="space-y-2">
              {recommendations.affiliate_optimization?.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="text-sm text-purple-800 flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-3">👑 Sponsored Content</h4>
            <ul className="space-y-2">
              {recommendations.sponsored_content_optimization?.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Revenue Projection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Current Monthly Revenue</h4>
            <div className="text-2xl font-bold text-green-600">${metrics.total_revenue.toLocaleString()}</div>
            <p className="text-sm text-gray-600 mt-1">
              From {metrics.newsletter_subscribers.toLocaleString()} newsletter subscribers
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Projected Annual Revenue</h4>
            <div className="text-2xl font-bold text-blue-600">
              ${(metrics.total_revenue * 12).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Based on current performance
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Growth Potential</h4>
            <div className="text-2xl font-bold text-purple-600">
              ${((metrics.total_revenue * 12) * 1.5).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              With optimization (50% increase)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
