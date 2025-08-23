'use client';

import { useEffect, useState } from 'react';
import { Share2, Eye, Users, TrendingUp } from 'lucide-react';

type ViralGrowthMetrics = {
  shares: number;
  impressions: number;
  signups: number;
  conversionRate: number;
  viralCoefficient: number;
  trending: boolean;
};

export default function ViralGrowthDashboard() {
  const [metrics] = useState<ViralGrowthMetrics>({
    shares: 0,
    impressions: 0,
    signups: 0,
    conversionRate: 0,
    viralCoefficient: 0,
    trending: false
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Viral Growth</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shares</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.shares.toLocaleString()}</p>
            </div>
            <Share2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.impressions.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Signups</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.signups.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Viral Coefficient</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.viralCoefficient.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="text-4xl mb-4">🚀</div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Viral Growth Dashboard</h4>
        <p className="text-gray-600">
          Track your viral marketing metrics and growth performance
        </p>
      </div>
    </div>
  );
}