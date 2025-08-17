'use client';

import { useAuth } from '@/app/lib/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PerformanceDashboard from '@/app/components/PerformanceDashboard';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <span className="font-bold text-gray-900">Analytics</span>
              </div>
            </div>
            
            {/* Plan Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.plan === 'pro' || user.plan === 'agency'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {user.plan?.toUpperCase() || 'FREE'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PerformanceDashboard />
      </div>
    </div>
  );
}