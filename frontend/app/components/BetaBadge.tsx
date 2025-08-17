'use client';

import { Crown, Sparkles } from 'lucide-react';

interface BetaBadgeProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'badge' | 'banner' | 'pill';
  className?: string;
}

export default function BetaBadge({ 
  size = 'medium', 
  variant = 'badge',
  className = '' 
}: BetaBadgeProps) {
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5', 
    large: 'text-base px-4 py-2'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const baseClasses = `
    inline-flex items-center font-semibold rounded-full
    bg-gradient-to-r from-purple-600 to-pink-600 text-white
    shadow-lg border-2 border-white/20
    ${sizeClasses[size]} ${className}
  `;

  if (variant === 'banner') {
    return (
      <div className={`
        flex items-center justify-center space-x-2 
        bg-gradient-to-r from-purple-50 to-pink-50 
        border border-purple-200 rounded-lg p-3 mb-4
        ${className}
      `}>
        <Crown className={`${iconSizes[size]} text-purple-600`} />
        <span className="text-purple-800 font-semibold">
          🎉 Beta Tester - You have free Agency access!
        </span>
        <Sparkles className={`${iconSizes[size]} text-purple-600`} />
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <span className={`
        inline-flex items-center space-x-1.5
        bg-gradient-to-r from-purple-100 to-pink-100
        text-purple-800 border border-purple-300
        rounded-full ${sizeClasses[size]} ${className}
      `}>
        <Crown className={iconSizes[size]} />
        <span>Beta Tester</span>
      </span>
    );
  }

  // Default badge variant
  return (
    <span className={baseClasses}>
      <Crown className={`${iconSizes[size]} mr-1.5`} />
      BETA
    </span>
  );
}