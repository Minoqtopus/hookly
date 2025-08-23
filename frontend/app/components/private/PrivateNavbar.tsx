'use client';

import React from 'react';
import { useApp, useUserStats } from '@/app/lib/context';
import { Crown, LogOut, Settings, Sparkles, ArrowLeft } from 'lucide-react';
import { ScarcityIndicator } from '@/app/components/public';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PrivateNavbarProps {
  onLogout?: () => Promise<void>;
}

export default function PrivateNavbar({ onLogout }: PrivateNavbarProps) {
  const { state } = useApp();
  const { user } = state;
  const userStats = useUserStats();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  // Don't render if no user
  if (!user) return null;

  // Determine page context
  const isGeneratePage = pathname === '/generate';
  const isSettingsPage = pathname === '/settings';
  const isDashboardPage = pathname === '/dashboard';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo or Back Button */}
          {isGeneratePage || isSettingsPage ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              {isSettingsPage && (
                <h1 className="text-2xl font-bold text-gray-900 ml-2">Settings</h1>
              )}
            </div>
          ) : (
            <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Hookly</span>
            </Link>
          )}
          
          {/* Right side - Context-specific content */}
          <div className="flex items-center gap-4">
            {/* Generate page specific content */}
            {isGeneratePage && (
              <>
                <ScarcityIndicator />
                {userStats && (
                  <div className="text-sm text-gray-600">
                    {userStats.generationsUsed || 0} generations used
                  </div>
                )}
              </>
            )}
            
            {/* Default navigation for dashboard and settings */}
            {!isGeneratePage && (
              <>
                {/* Plan Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.plan === 'agency'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
                    : user.plan === 'starter' || user.plan === 'pro'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.plan === 'agency' ? (
                    <div className="flex items-center">
                      <Crown className="h-3 w-3 mr-1" />
                      {user.is_beta_user ? 'AGENCY (FREE)' : 'AGENCY'}
                    </div>
                  ) : user.plan === 'starter' || user.plan === 'pro' ? (
                    <div className="flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {user.plan === 'starter' ? 'STARTER' : 'PRO'}
                    </div>
                  ) : 'TRIAL'}
                </div>
                
                {!isSettingsPage && (
                  <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600">
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}