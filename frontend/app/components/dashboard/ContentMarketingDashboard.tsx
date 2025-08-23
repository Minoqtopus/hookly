'use client';

import { Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function ContentMarketingDashboard() {
  const [stats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalReach: 0,
    engagement: 0,
    conversions: 0,
    revenue: 0
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Content Marketing</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReach.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Content Marketing Dashboard</h4>
        <p className="text-gray-600">
          Track your content marketing campaigns and performance metrics
        </p>
      </div>
    </div>
  );
}