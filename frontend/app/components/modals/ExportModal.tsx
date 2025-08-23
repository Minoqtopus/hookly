'use client';

import { useState } from 'react';
import { AnalyticsService, EventType } from '../lib/analytics';
import {
  SocialPlatform
} from '../lib/userStyle';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    hook: string;
    script: string;
    visualDescription: string;
    callToAction: string;
    platformOptimization: string;
  };
  userStyleProfile?: any;
}

interface PlatformExport {
  platform: SocialPlatform;
  name: string;
  description: string;
  content: string;
  format: string;
  bestPractices: string[];
  hashtags: string[];
  estimatedPerformance: {
    views: number;
    engagement: number;
    viralScore: number;
  };
}

export default function ExportModal({ isOpen, onClose, content, userStyleProfile }: ExportModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([SocialPlatform.TIKTOK]);
  const [exportFormat, setExportFormat] = useState<'copy' | 'download'>('copy');
  const [showViralGrowth, setShowViralGrowth] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  if (!isOpen) return null;

  const platforms: PlatformExport[] = [
    {
      platform: SocialPlatform.TIKTOK,
      name: 'TikTok',
      description: 'Short-form vertical video content optimized for viral engagement',
      content: formatTikTokContent(content),
      format: 'Vertical video (9:16)',
      bestPractices: [
        'Hook viewers in first 3 seconds',
        'Use trending sounds and hashtags',
        'Encourage comments and shares',
        'Add captions for accessibility',
        'Use quick cuts and transitions'
      ],
      hashtags: generateHashtags('tiktok', content),
      estimatedPerformance: { views: 50000, engagement: 8500, viralScore: 78 }
    },
    {
      platform: SocialPlatform.INSTAGRAM,
      name: 'Instagram',
      description: 'Visual content optimized for Instagram engagement and discoverability',
      content: formatInstagramContent(content),
      format: 'Square/Portrait video or carousel',
      bestPractices: [
        'Focus on high-quality visuals',
        'Use 5-15 relevant hashtags',
        'Encourage saves and shares',
        'Create engaging Stories',
        'Use consistent color palette'
      ],
      hashtags: generateHashtags('instagram', content),
      estimatedPerformance: { views: 25000, engagement: 4200, viralScore: 72 }
    },
    {
      platform: SocialPlatform.X,
      name: 'X (Twitter)',
      description: 'Concise, impactful messaging optimized for X engagement',
      content: formatXContent(content),
      format: 'Text with visual attachment',
      bestPractices: [
        'Keep content concise and impactful',
        'Use trending hashtags strategically',
        'Encourage retweets and replies',
        'Include visual content when possible',
        'Use thread format for longer content'
      ],
      hashtags: generateHashtags('x', content),
      estimatedPerformance: { views: 15000, engagement: 2800, viralScore: 68 }
    },
    {
      platform: SocialPlatform.YOUTUBE,
      name: 'YouTube',
      description: 'Longer-form content optimized for YouTube discovery and engagement',
      content: formatYouTubeContent(content),
      format: 'Landscape video (16:9)',
      bestPractices: [
        'Create strong intro hooks',
        'Use cards and end screens',
        'Encourage subscriptions',
        'Optimize titles and descriptions for SEO',
        'Include timestamps for longer content'
      ],
      hashtags: generateHashtags('youtube', content),
      estimatedPerformance: { views: 35000, engagement: 6200, viralScore: 75 }
    }
  ];

  const selectedExports = platforms.filter(p => selectedPlatforms.includes(p.platform));

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCopyAll = async () => {
    const exportText = selectedExports.map(exp => 
      `=== ${exp.name.toUpperCase()} EXPORT ===\n\n${exp.content}\n\nBest Practices:\n${exp.bestPractices.map(bp => `• ${bp}`).join('\n')}\n\nHashtags: ${exp.hashtags.join(' ')}\n\nEstimated Performance: ${exp.estimatedPerformance.views.toLocaleString()} views, ${exp.estimatedPerformance.engagement.toLocaleString()} engagement, ${exp.estimatedPerformance.viralScore}/100 viral score\n\n`
    ).join('\n');

    // Add "Made with Hookly" watermark
    const watermarkedText = `${exportText}\n\n---\nMade with Hookly - AI-Powered UGC Content Generation\nCreate viral content at hookly.ai`;

    try {
      await navigator.clipboard.writeText(watermarkedText);
      
      // Track viral growth event
      AnalyticsService.trackEvent(EventType.COPY_TO_CLIPBOARD, {
        eventData: {
          platforms: selectedPlatforms,
          content_length: watermarkedText.length,
          viral_watermark: true,
          estimated_performance: selectedExports.reduce((total, exp) => total + exp.estimatedPerformance.viralScore, 0) / selectedExports.length
        }
      });

      alert('All content copied to clipboard with Hookly watermark!');
      
      // Show viral growth prompt
      setShowViralGrowth(true);
      generateShareUrl();
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = watermarkedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('All content copied to clipboard with Hookly watermark!');
      setShowViralGrowth(true);
      generateShareUrl();
    }
  };

  const handleDownloadAll = () => {
    const exportText = selectedExports.map(exp => 
      `=== ${exp.name.toUpperCase()} EXPORT ===\n\n${exp.content}\n\nBest Practices:\n${exp.bestPractices.map(bp => `• ${bp}`).join('\n')}\n\nHashtags: ${exp.hashtags.join(' ')}\n\nEstimated Performance: ${exp.estimatedPerformance.views.toLocaleString()} views, ${exp.estimatedPerformance.engagement.toLocaleString()} engagement, ${exp.estimatedPerformance.viralScore}/100 viral score\n\n`
    ).join('\n');

    // Add "Made with Hookly" watermark
    const watermarkedText = `${exportText}\n\n---\nMade with Hookly - AI-Powered UGC Content Generation\nCreate viral content at hookly.ai`;

    const blob = new Blob([watermarkedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hookly-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Track viral growth event
    AnalyticsService.trackEvent(EventType.EXPORT_GENERATION, {
      eventData: {
        platforms: selectedPlatforms,
        content_length: watermarkedText.length,
        viral_watermark: true,
        estimated_performance: selectedExports.reduce((total, exp) => total + exp.estimatedPerformance.viralScore, 0) / selectedExports.length
      }
    });

    // Show viral growth prompt
    setShowViralGrowth(true);
    generateShareUrl();
  };

  const generateShareUrl = () => {
    // Create a shareable URL for this content
    const shareData = {
      content: btoa(JSON.stringify(content)), // Base64 encode content
      platforms: selectedPlatforms.join(','),
      timestamp: Date.now()
    };
    
    const shareUrl = `${window.location.origin}/demo?share=${encodeURIComponent(JSON.stringify(shareData))}`;
    setShareUrl(shareUrl);
  };

  const handleSocialShare = (platform: string) => {
    const shareText = `Just created viral content with Hookly! 🚀\n\nCheck out this AI-generated UGC:\n${content.hook.substring(0, 100)}...\n\nCreate your own at hookly.ai`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://hookly.ai')}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://hookly.ai')}&title=${encodeURIComponent('Viral Content Created with Hookly')}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://hookly.ai')}&quote=${encodeURIComponent(shareText)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Track social sharing event
      AnalyticsService.trackEvent(EventType.SHARE_GENERATION, {
        eventData: {
          platform,
          content_type: 'viral_ugc',
          estimated_performance: selectedExports.reduce((total, exp) => total + exp.estimatedPerformance.viralScore, 0) / selectedExports.length
        }
      });
    }
  };

  const handleViralGrowthSignup = () => {
    // Track viral growth conversion event
    AnalyticsService.trackEvent(EventType.UPGRADE_MODAL_SHOWN, {
      eventData: {
        trigger_source: 'viral_growth',
        content_performance: selectedExports.reduce((total, exp) => total + exp.estimatedPerformance.viralScore, 0) / selectedExports.length,
        platforms_used: selectedPlatforms
      }
    });

    // Close modal and trigger signup
    onClose();
    // This would typically trigger a signup modal or redirect
    window.location.href = '/auth/signup?source=viral_growth';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Multi-Platform Export</h2>
            <p className="text-gray-600">Export your content optimized for multiple platforms</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Platform Selection */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => (
              <label key={platform.platform} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platform.platform)}
                  onChange={() => handlePlatformToggle(platform.platform)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{platform.name}</div>
                  <div className="text-gray-500 text-xs">{platform.format}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
              <p className="text-gray-600">Choose how you want to export your content</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopyAll}
                disabled={selectedPlatforms.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copy All ({selectedPlatforms.length})
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={selectedPlatforms.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download All ({selectedPlatforms.length})
              </button>
            </div>
          </div>
        </div>

        {/* Viral Growth Section */}
        {showViralGrowth && (
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Your Content is Ready to Go Viral!</h3>
              <p className="text-gray-600 mb-4">
                Share your creation and inspire others to create viral content with Hookly
              </p>
              
              {/* Social Sharing Buttons */}
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on X
                </button>
                
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Share on LinkedIn
                </button>
                
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </button>
              </div>
              
              {/* Viral Growth Call-to-Action */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">🎯 Ready to Create More Viral Content?</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Join thousands of creators using Hookly to generate viral UGC content
                </p>
                <button
                  onClick={handleViralGrowthSignup}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 font-medium"
                >
                  Start Creating Now - It's Free! 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Platform Exports */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedExports.map((platformExport) => (
              <div key={platformExport.platform} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-gray-900">{platformExport.name}</h4>
                  <div className="text-sm text-gray-500">
                    {platformExport.estimatedPerformance.views.toLocaleString()} views
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{platformExport.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Content</h5>
                    <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                      {platformExport.content}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Best Practices</h5>
                    <ul className="space-y-1">
                      {platformExport.bestPractices.map((practice, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Recommended Hashtags</h5>
                    <div className="flex flex-wrap gap-2">
                      {platformExport.hashtags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Performance Metrics</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Views</div>
                        <div className="font-semibold">{platformExport.estimatedPerformance.views.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Engagement</div>
                        <div className="font-semibold">{platformExport.estimatedPerformance.engagement.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Viral Score</div>
                        <div className="font-semibold">{platformExport.estimatedPerformance.viralScore}/100</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Platform-specific content formatting functions
function formatTikTokContent(content: any): string {
  return `HOOK (First 3 seconds):
${content.hook}

SCRIPT:
${content.script}

VISUAL DESCRIPTION:
${content.visualDescription}

CALL TO ACTION:
${content.callToAction}

PLATFORM OPTIMIZATION:
${content.platformOptimization}`;
}

function formatInstagramContent(content: any): string {
  return `CAPTION:
${content.hook}

${content.script}

VISUAL STYLE:
${content.visualDescription}

ENGAGEMENT:
${content.callToAction}

OPTIMIZATION TIPS:
${content.platformOptimization}`;
}

function formatXContent(content: any): string {
  return `TWEET:
${content.hook}

${content.script}

VISUAL:
${content.visualDescription}

CALL TO ACTION:
${content.callToAction}

OPTIMIZATION:
${content.platformOptimization}`;
}

function formatYouTubeContent(content: any): string {
  return `TITLE:
${content.hook}

DESCRIPTION:
${content.script}

VISUAL SETUP:
${content.visualDescription}

CALL TO ACTION:
${content.callToAction}

OPTIMIZATION:
${content.platformOptimization}`;
}

// Hashtag generation function
function generateHashtags(platform: string, content: any): string[] {
  const baseHashtags = ['viral', 'trending', 'content', 'creator'];
  const platformHashtags = {
    tiktok: ['tiktok', 'fyp', 'foryou', 'viral'],
    instagram: ['instagram', 'reels', 'viral', 'trending'],
    x: ['twitter', 'viral', 'trending', 'content'],
    youtube: ['youtube', 'viral', 'trending', 'content']
  };
  
  // Extract potential hashtags from content
  const contentWords = content.script.toLowerCase().split(' ');
  const contentHashtags = contentWords
    .filter((word: string) => word.length > 3 && /^[a-z]+$/.test(word))
    .slice(0, 5)
    .map((word: string) => `#${word}`);
  
  return [...baseHashtags, ...platformHashtags[platform as keyof typeof platformHashtags], ...contentHashtags];
}