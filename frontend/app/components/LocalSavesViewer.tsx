'use client';

import { LocalSaveService, LocalSavedAd } from '@/app/lib/localSaves';
import { Calendar, Copy, Download, Heart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '../lib/toast';
import ExportModal from './ExportModal';

export default function LocalSavesViewer() {
  const [savedAds, setSavedAds] = useState<LocalSavedAd[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<LocalSavedAd | null>(null);
  const [storageStats, setStorageStats] = useState({ used: 0, limit: 3, available: 3 });

  useEffect(() => {
    loadSavedAds();
  }, []);

  const loadSavedAds = () => {
    const ads = LocalSaveService.getSavedAds();
    setSavedAds(ads);
    setStorageStats(LocalSaveService.getStorageStats());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this saved ad?')) {
      LocalSaveService.removeAd(id);
      loadSavedAds();
    }
  };

  const handleToggleFavorite = (id: string) => {
    LocalSaveService.toggleFavorite(id);
    loadSavedAds();
  };

  const handleExport = (ad: LocalSavedAd) => {
    setSelectedAd(ad);
    setShowExportModal(true);
  };

  const handleCopyHook = async (hook: string) => {
    try {
      await navigator.clipboard.writeText(hook);
      toast.success('Hook copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy hook');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (savedAds.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Ads Yet</h3>
          <p className="text-gray-600 mb-6">
            Generate ads and save your favorites locally. You can save up to {storageStats.limit} ads as a guest.
          </p>
          <a href="/generate" className="btn-primary">
            Generate Your First Ad
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Saved Ads</h2>
          <p className="text-gray-600 text-sm">
            {storageStats.used} of {storageStats.limit} saves used • {storageStats.available} remaining
          </p>
        </div>

        {/* Storage Progress */}
        <div className="flex items-center space-x-3">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(storageStats.used / storageStats.limit) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {storageStats.used}/{storageStats.limit}
          </span>
        </div>
      </div>

      {/* Storage Warning */}
      {storageStats.available === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-amber-900 mb-1">Storage Limit Reached</h4>
              <p className="text-sm text-amber-700 mb-3">
                You've used all 3 guest saves. Sign up for premium storage!
              </p>
              <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                Sign Up for Free
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Ads Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedAds.map((ad) => (
          <div key={ad.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(ad.createdAt)}
                </div>
              </div>
              <button
                onClick={() => handleToggleFavorite(ad.id)}
                className={`p-1 rounded ${ad.isFavorite ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart className={`h-4 w-4 ${ad.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{ad.niche}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500 truncate">{ad.targetAudience}</span>
            </div>

            {/* Performance Metrics */}
            {ad.performance && (
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                  <div className="text-sm font-bold text-blue-600">{(ad.performance.estimatedViews / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-green-600">{ad.performance.estimatedCTR}%</div>
                  <div className="text-xs text-gray-500">CTR</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-purple-600">{ad.performance.viralScore}/10</div>
                  <div className="text-xs text-gray-500">Viral</div>
                </div>
              </div>
            )}

            {/* Hook Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700 italic line-clamp-2">
                "{ad.hook}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyHook(ad.hook)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm flex items-center justify-center"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Hook
              </button>
              <button
                onClick={() => handleExport(ad)}
                className="bg-primary-100 hover:bg-primary-200 text-primary-700 py-2 px-3 rounded text-sm flex items-center justify-center"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </button>
              <button
                onClick={() => handleDelete(ad.id)}
                className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded text-sm flex items-center justify-center"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Export Modal */}
      {selectedAd && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setSelectedAd(null);
          }}
          content={{
            hook: selectedAd.hook,
            script: selectedAd.script,
            visualDescription: selectedAd.visuals.join(', '),
            callToAction: `Check out this amazing ${selectedAd.niche} content!`,
            platformOptimization: `Optimized for ${selectedAd.targetAudience} in the ${selectedAd.niche} niche`
          }}
        />
      )}
    </div>
  );
}