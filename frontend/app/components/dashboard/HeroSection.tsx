'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  userName: string;
  streak?: number;
}

export default function HeroSection({ userName, streak }: HeroSectionProps) {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {streak ? 
            `Amazing! You're on a ${streak}-day streak. Keep the momentum going! 🔥` :
            'Ready to create viral ad content that converts? Let\'s get started! 💪'
          }
        </p>
      </div>
      
      <div className="space-y-4">
        <Link 
          href="/generate" 
          className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Sparkles className="h-6 w-6 mr-3" />
          Generate Viral Ad
        </Link>
        
        <p className="text-sm text-gray-500">
          Create high-converting ads in under 30 seconds
        </p>
      </div>
    </div>
  );
}