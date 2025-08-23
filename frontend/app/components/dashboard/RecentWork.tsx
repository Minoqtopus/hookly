'use client';

import { Generation } from '@/app/lib/context';
import { dashboardCopy } from '@/app/lib/copy';
import { ArrowRight, Copy, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';

interface RecentWorkProps {
  generations: Generation[];
  onCopyGeneration: (generation: Generation) => void;
  onShareGeneration: (generation: Generation) => void;
  onToggleFavorite: (generationId: string) => Promise<void>;
}

export default function RecentWork({ 
  generations, 
  onCopyGeneration, 
  onShareGeneration, 
  onToggleFavorite 
}: RecentWorkProps) {
  
  if (generations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <div className="text-4xl mb-4">{dashboardCopy.recentWork.emptyState.icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{dashboardCopy.recentWork.emptyState.title}</h3>
        <p className="text-gray-600 mb-6">{dashboardCopy.recentWork.emptyState.subtitle}</p>
        <Link 
          href="/generate" 
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          {dashboardCopy.recentWork.emptyState.button}
        </Link>
      </div>
    );
  }

  // Show only the 3 most recent
  const recentGenerations = generations.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{dashboardCopy.recentWork.sectionTitle}</h2>
        {generations.length > 3 && (
          <Link 
            href="/history" 
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            {dashboardCopy.recentWork.viewAll}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recentGenerations.map((generation) => (
          <div 
            key={generation.id} 
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {generation.title || dashboardCopy.recentWork.labels.untitled}
              </h3>
              <button 
                onClick={() => onToggleFavorite(generation.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 ${generation.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              "{generation.hook}"
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {generation.niche || dashboardCopy.recentWork.labels.general}
              </span>
              <span>{generation.created_at}</span>
            </div>
            
            {generation.performance_data && (
              <div className="flex items-center justify-between text-xs mb-4 py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-green-600">
                  <span className="mr-1">📈</span>
                  {dashboardCopy.recentWork.labels.views(generation.performance_data.views || 0)}
                </div>
                <div className="text-blue-600">
                  🎯 {dashboardCopy.recentWork.labels.ctr(generation.performance_data.ctr || 0)}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onCopyGeneration(generation)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
              >
                <Copy className="h-3 w-3 mr-1" />
                {dashboardCopy.recentWork.actions.copy}
              </button>
              <button 
                onClick={() => onShareGeneration(generation)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
              >
                <Share2 className="h-3 w-3 mr-1" />
                {dashboardCopy.recentWork.actions.share}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}