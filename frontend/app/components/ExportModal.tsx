'use client';

import { useState } from 'react';
import { X, Download, Copy, FileText, Instagram, Youtube, Mail, CheckCircle } from 'lucide-react';
import { ExportService, AdData } from '@/app/lib/exportUtils';
import { toast } from '../lib/toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  adData: AdData;
}

export default function ExportModal({ isOpen, onClose, adData }: ExportModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const exportFormats = [
    {
      id: 'text',
      name: 'Formatted Text',
      description: 'Clean text format with sections',
      icon: FileText,
      action: 'copy',
      color: 'bg-blue-500',
      premium: false
    },
    {
      id: 'tiktok',
      name: 'TikTok Format',
      description: 'Optimized for TikTok posts',
      icon: '🎵',
      action: 'copy',
      color: 'bg-black',
      premium: false
    },
    {
      id: 'instagram',
      name: 'Instagram Reels',
      description: 'Perfect for IG Reels',
      icon: Instagram,
      action: 'copy',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      premium: false
    },
    {
      id: 'youtube',
      name: 'YouTube Shorts',
      description: 'YouTube Shorts format',
      icon: Youtube,
      action: 'copy',
      color: 'bg-red-500',
      premium: false
    },
    {
      id: 'email',
      name: 'Client Email',
      description: 'Professional email template',
      icon: Mail,
      action: 'copy',
      color: 'bg-green-500',
      premium: true
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional PDF document',
      icon: Download,
      action: 'download',
      color: 'bg-purple-500',
      premium: true
    }
  ];

  const handleExport = async (format: any) => {
    setIsLoading(true);
    
    try {
      let content = '';
      
      switch (format.id) {
        case 'text':
          content = ExportService.exportAsText(adData);
          break;
        case 'tiktok':
          content = ExportService.exportAsTikTok(adData);
          break;
        case 'instagram':
          content = ExportService.exportAsInstagram(adData);
          break;
        case 'youtube':
          content = ExportService.exportAsYouTube(adData);
          break;
        case 'email':
          content = ExportService.exportAsClientEmail(adData);
          break;
        case 'pdf':
          ExportService.openPDFPreview(adData);
          setIsLoading(false);
          return;
      }

      if (format.action === 'copy') {
        const success = await ExportService.copyToClipboard(content);
        if (success) {
          setCopiedFormat(format.id);
          setTimeout(() => setCopiedFormat(null), 2000);
        } else {
          toast.error('Failed to copy. Please try again.');
        }
      } else if (format.action === 'download') {
        const filename = `${adData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
        ExportService.downloadAsFile(content, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl w-full max-w-2xl mx-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Your Ad</h2>
              <p className="text-sm text-gray-600">Choose your preferred format</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Ad Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">{adData.title}</h3>
              <p className="text-sm text-gray-600 italic">"{adData.hook}"</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span className="bg-gray-200 px-2 py-1 rounded">{adData.niche}</span>
                <span className="ml-2">• {adData.targetAudience}</span>
              </div>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format)}
                  disabled={isLoading}
                  className="relative p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {/* Premium Badge */}
                  {format.premium && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        PRO
                      </span>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${format.color}`}>
                      {typeof format.icon === 'string' ? (
                        <span className="text-lg">{format.icon}</span>
                      ) : (
                        <format.icon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {format.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {format.description}
                      </p>
                      
                      {/* Action indicator */}
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        {format.action === 'copy' ? (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            {copiedFormat === format.id ? 'Copied!' : 'Click to copy'}
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            Click to download
                          </>
                        )}
                      </div>
                    </div>

                    {/* Success indicator */}
                    {copiedFormat === format.id && (
                      <div className="absolute inset-0 bg-green-50 rounded-lg flex items-center justify-center">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">Copied!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Pro Upsell */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                  <Download className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Unlock All Export Formats</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get PDF reports, client emails, and priority support with Pro
                  </p>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                    Upgrade to Pro - $1.30/day
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}