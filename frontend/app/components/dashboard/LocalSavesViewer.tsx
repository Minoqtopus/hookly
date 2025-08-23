'use client';

import { Calendar, Copy, Download, Heart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/app/lib/utils';
import { ExportModal } from '../modals';

type LocalSavedAd = {
  id: string;
  hook: string;
  script: string;
  productName: string;
  niche: string;
  targetAudience: string;
  createdAt: string;
};

export default function LocalSavesViewer() {
  const [savedAds, setSavedAds] = useState<LocalSavedAd[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<LocalSavedAd | null>(null);
  const [storageStats] = useState({ used: 0, limit: 3, available: 3 });

  useEffect(() => {
    // Mock empty saved ads for now
    setSavedAds([]);
  }, []);

  const handleCopy = (ad: LocalSavedAd) => {
    const content = `${ad.hook}\n\n${ad.script}`;
    navigator.clipboard.writeText(content);
    toast.success('Ad content copied to clipboard!');
  };

  const handleExport = (ad: LocalSavedAd) => {
    setSelectedAd(ad);
    setShowExportModal(true);
  };

  const handleDelete = (id: string) => {
    setSavedAds(prev => prev.filter(ad => ad.id !== id));
    toast.success('Ad deleted from local saves');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Local Saves</h3>
        <div className="text-sm text-gray-500">
          {storageStats.used}/{storageStats.limit} saves used
        </div>
      </div>

      {savedAds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Saved Ads</h4>
          <p className="text-gray-600">
            Your locally saved ad drafts will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedAds.map((ad) => (
            <div key={ad.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{ad.productName}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(ad)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleExport(ad)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Export"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 line-clamp-2">
                {ad.hook}
              </div>
            </div>
          ))}
        </div>
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        content={selectedAd ? `${selectedAd.hook}\n\n${selectedAd.script}` : ''}
        title={selectedAd?.productName || ''}
      />
    </div>
  );
}