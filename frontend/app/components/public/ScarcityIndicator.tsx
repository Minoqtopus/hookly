'use client';

import { Clock, Flame, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScarcityIndicatorProps {
  type?: 'users_online' | 'recent_signups' | 'limited_spots' | 'trending';
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const scarcityMessages = {
  users_online: [
    { count: 47, message: 'people generating ads right now', icon: Users, color: 'text-green-600 bg-green-100' },
    { count: 23, message: 'people just upgraded to Pro', icon: Zap, color: 'text-blue-600 bg-blue-100' },
            { count: 12, message: 'users online in your niche', icon: Flame, color: 'text-orange-600 bg-orange-100' },
  ],
  recent_signups: [
    { count: 89, message: 'people signed up in the last hour', icon: Users, color: 'text-purple-600 bg-purple-100' },
    { count: 234, message: 'new Pro users this week', icon: Zap, color: 'text-blue-600 bg-blue-100' },
    { count: 156, message: 'ads generated in the last 24h', icon: Flame, color: 'text-orange-600 bg-orange-100' },
  ],
  limited_spots: [
    { count: 73, message: 'Pro spots left this month', icon: Clock, color: 'text-red-600 bg-red-100' },
    { count: 12, message: 'early access spots remaining', icon: Flame, color: 'text-orange-600 bg-orange-100' },
    { count: 45, message: 'discounted spots available', icon: Zap, color: 'text-blue-600 bg-blue-100' },
  ],
  trending: [
    { count: 2847, message: 'ads went viral this week', icon: Flame, color: 'text-orange-600 bg-orange-100' },
            { count: 1203, message: 'users hit 100K+ views', icon: Users, color: 'text-green-600 bg-green-100' },
    { count: 567, message: 'businesses scaled with our ads', icon: Zap, color: 'text-blue-600 bg-blue-100' },
  ],
};

export default function ScarcityIndicator({ 
  type = 'users_online', 
  className = '', 
  size = 'medium' 
}: ScarcityIndicatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);

  const messages = scarcityMessages[type];
  const currentMessage = messages[currentIndex];

  useEffect(() => {
    // Cycle through different scarcity messages
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    // Animate the counter when message changes
    setCount(0);
    const targetCount = currentMessage.count;
    const duration = 2000; // 2 seconds
    const increment = targetCount / (duration / 50);

    const counter = setInterval(() => {
      setCount(prev => {
        if (prev >= targetCount) {
          clearInterval(counter);
          return targetCount;
        }
        return Math.min(prev + increment, targetCount);
      });
    }, 50);

    return () => clearInterval(counter);
  }, [currentMessage]);

  const IconComponent = currentMessage.icon;
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-3'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  return (
    <div className={`inline-flex items-center rounded-full border ${currentMessage.color} ${sizeClasses[size]} ${className}`}>
      <IconComponent className={`${iconSizes[size]} mr-2`} />
      <span className="font-medium">
        {Math.floor(count).toLocaleString()} {currentMessage.message}
      </span>
    </div>
  );
}