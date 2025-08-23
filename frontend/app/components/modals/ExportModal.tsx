'use client';

import { useState } from 'react';
import { Download, Copy, X, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
}

export default function ExportModal({ isOpen, onClose, content, title }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState('text');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    // Could show a toast here
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'ad-content'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Export Ad Content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Content Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Preview
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <pre className="whitespace-pre-wrap text-sm text-gray-900">{content}</pre>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['text', 'csv', 'json'].map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`p-3 text-center border rounded-lg transition-colors ${
                    exportFormat === format
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Platforms (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatforms(prev =>
                        prev.includes(platform.id)
                          ? prev.filter(id => id !== platform.id)
                          : [...prev, platform.id]
                      );
                    }}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <Copy className="h-5 w-5" />
              Copy to Clipboard
            </button>
            
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="h-5 w-5" />
              Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}