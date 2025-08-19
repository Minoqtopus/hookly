'use client';

import { useState } from 'react';
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

    try {
      await navigator.clipboard.writeText(exportText);
      alert('All content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = exportText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('All content copied to clipboard!');
    }
  };

  const handleDownloadAll = () => {
    const exportText = selectedExports.map(exp => 
      `=== ${exp.name.toUpperCase()} EXPORT ===\n\n${exp.content}\n\nBest Practices:\n${exp.bestPractices.map(bp => `• ${bp}`).join('\n')}\n\nHashtags: ${exp.hashtags.join(' ')}\n\nEstimated Performance: ${exp.estimatedPerformance.views.toLocaleString()} views, ${exp.estimatedPerformance.engagement.toLocaleString()} engagement, ${exp.estimatedPerformance.viralScore}/100 viral score\n\n`
    ).join('\n');

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hookly-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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