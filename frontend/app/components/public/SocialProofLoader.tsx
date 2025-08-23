'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';

interface SocialProofLoaderProps {
  size?: 'small' | 'large';
  className?: string;
}

const socialProofMessages = [
  { message: 'Sarah just generated an ad for skincare products', icon: Zap, color: 'text-blue-600' },
  { message: 'Mike created a viral ad that got 150K views', icon: TrendingUp, color: 'text-green-600' },
  { message: 'Emma generated 3 ads for her fitness brand', icon: Users, color: 'text-purple-600' },
  { message: 'Alex just upgraded to Pro after seeing results', icon: Zap, color: 'text-blue-600' },
  { message: 'Lisa created an ad that converted at 8.2%', icon: TrendingUp, color: 'text-green-600' },
  { message: '127 people generated ads in the last hour', icon: Users, color: 'text-purple-600' },
  { message: 'David just created an ad for his coffee shop', icon: Zap, color: 'text-blue-600' },
  { message: 'Rachel\'s ad generated 89K views yesterday', icon: TrendingUp, color: 'text-green-600' },
];

export default function SocialProofLoader({ size = 'large', className = '' }: SocialProofLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through messages every 3 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % socialProofMessages.length);
    }, 3000);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const isSmall = size === 'small';
  const isWhiteText = className.includes('text-white');
  const currentMessage = socialProofMessages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  // Different layouts for small vs large
  if (isSmall) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Spinner */}
        <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${
          isWhiteText ? 'border-white' : 'border-primary-600'
        }`}></div>
        
        {/* Messages */}
        <div className="text-left">
          <div className={`font-medium ${isWhiteText ? 'text-white' : 'text-gray-900'} text-sm`}>
            AI is crafting your viral ad...
          </div>
          <div className={`text-xs ${isWhiteText ? 'text-white/75' : 'text-gray-600'}`}>
            {currentMessage.message}
          </div>
        </div>
      </div>
    );
  }

  // Large version (for homepage demo)
  return (
    <div className={`text-center ${className}`}>
      {/* Spinner */}
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 mx-auto mb-4 h-12 w-12`}></div>
      
      {/* Main loading message */}
      <p className="text-gray-900 font-medium mb-2 text-base">
        AI is crafting your viral ad...
      </p>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Social proof message */}
      <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
        <IconComponent className={`h-4 w-4 ${currentMessage.color}`} />
        <span>{currentMessage.message}</span>
      </div>
      
      {/* Sub-message */}
      <p className="text-gray-500 mt-2 text-sm">
        Analyzing trending patterns and viral hooks...
      </p>
    </div>
  );
}