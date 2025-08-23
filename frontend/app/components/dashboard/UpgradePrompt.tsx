'use client';

import { Crown } from 'lucide-react';

interface UpgradePromptProps {
  trialEndsAt?: string;
  generationsUsed?: number;
  generationsLimit?: number;
  onUpgrade: () => void;
}

export default function UpgradePrompt({ 
  trialEndsAt, 
  generationsUsed = 0, 
  generationsLimit = 15, 
  onUpgrade 
}: UpgradePromptProps) {
  
  const isNearLimit = generationsUsed >= generationsLimit * 0.8;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 7;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Crown className="h-6 w-6 text-primary-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trial Account</h3>
            <p className="text-sm text-gray-600">{daysLeft} days remaining</p>
          </div>
        </div>
        
        <button
          onClick={onUpgrade}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Upgrade
        </button>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>Usage: {generationsUsed}/{generationsLimit} ads</span>
        <span>{Math.round((generationsUsed / generationsLimit) * 100)}% used</span>
      </div>
      
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 rounded-full h-2 transition-all duration-300"
          style={{ width: `${Math.min(100, (generationsUsed / generationsLimit) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
}