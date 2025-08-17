'use client';

import { Clock, ArrowRight, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrialCountdownProps {
  trialEndsAt?: string;
  generationsUsed?: number;
  generationsLimit?: number;
  onUpgrade?: () => void;
  className?: string;
}

export default function TrialCountdown({ 
  trialEndsAt, 
  generationsUsed = 0, 
  generationsLimit = 15,
  onUpgrade,
  className = '' 
}: TrialCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!trialEndsAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = new Date(trialEndsAt).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const isExpiringSoon = timeLeft.days === 0 && timeLeft.hours < 24;
  const generationsRemaining = Math.max(0, generationsLimit - generationsUsed);
  const usagePercentage = (generationsUsed / generationsLimit) * 100;

  if (isExpired) {
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <Clock className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Trial Expired</h3>
          <p className="text-red-700 mb-4">
            Your free trial has ended. Upgrade now to continue creating viral ads!
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center"
            >
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-900">Free Trial</span>
        </div>
        {isExpiringSoon && (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
            Expires Soon!
          </span>
        )}
      </div>

      {/* Time Remaining */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds }
        ].map((time) => (
          <div key={time.label} className="text-center">
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <div className="text-lg font-bold text-gray-900">
                {time.value.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1">{time.label}</div>
          </div>
        ))}
      </div>

      {/* Usage Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>Generations Used</span>
          <span>{generationsUsed}/{generationsLimit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              usagePercentage > 80 ? 'bg-red-500' : 
              usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {generationsRemaining} generations remaining
        </div>
      </div>

      {/* Upgrade CTA */}
      {(isExpiringSoon || usagePercentage > 60) && onUpgrade && (
        <div className="text-center pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-700 mb-3">
            {isExpiringSoon 
              ? "Don't lose access to unlimited viral ad generation!" 
              : "Running low on generations? Upgrade for unlimited access!"
            }
          </p>
          <button
            onClick={onUpgrade}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
          >
            Upgrade Now
            <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}