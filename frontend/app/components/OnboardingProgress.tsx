'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Target, TrendingUp } from 'lucide-react';
import { AuthService } from '@/app/lib/auth';

interface OnboardingStep {
  step: string;
  completed: boolean;
  completedAt?: string;
  timeToComplete?: number;
}

interface EngagementScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'super_user';
  factors: {
    daysActive: number;
    generationsCreated: number;
    featuresUsed: number;
    emailVerified: boolean;
    trialToActiveTime: number;
    socialSharing: number;
    upgradeIntent: number;
  };
}

export default function OnboardingProgress() {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [engagement, setEngagement] = useState<EngagementScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    const tokens = AuthService.getStoredTokens();
    if (!tokens?.accessToken) return;

    try {
      const [progressRes, engagementRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/onboarding/progress`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/onboarding/engagement-score`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
        })
      ]);

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setSteps(progressData);
      }

      if (engagementRes.ok) {
        const engagementData = await engagementRes.json();
        setEngagement(engagementData);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: string): string => {
    const titles = {
      email_verified: 'Verify Your Email',
      first_generation: 'Create Your First Ad',
      template_explored: 'Try a Template',
      feature_discovered: 'Use Advanced Features',
      upgrade_awareness: 'Explore Premium Plans',
    };
    return titles[step as keyof typeof titles] || step;
  };

  const getStepDescription = (step: string): string => {
    const descriptions = {
      email_verified: 'Secure your account and unlock full features',
      first_generation: 'Generate your first compelling ad copy',
      template_explored: 'Browse and use our professional templates',
      feature_discovered: 'Try copying, exporting, or saving your work',
      upgrade_awareness: 'Discover what you can achieve with premium features',
    };
    return descriptions[step as keyof typeof descriptions] || '';
  };

  const getEngagementColor = (level: string): string => {
    const colors = {
      low: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-green-600 bg-green-100',
      super_user: 'text-purple-600 bg-purple-100',
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-600" />
            Onboarding Progress
          </h3>
          <div className="text-sm text-gray-600">
            {completedSteps} of {totalSteps} completed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {getStepTitle(step.step)}
                  </h4>
                  {step.completed && step.timeToComplete && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.timeToComplete < 1 
                        ? '< 1h' 
                        : `${Math.round(step.timeToComplete)}h`
                      }
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {getStepDescription(step.step)}
                </p>
                {step.completed && step.completedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Completed {new Date(step.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {completedSteps === totalSteps && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">
                🎉 Onboarding Complete! You're all set to create amazing ads.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Engagement Score */}
      {engagement && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
            Engagement Score
          </h3>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">{engagement.score}</div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEngagementColor(engagement.level)}`}>
              {engagement.level.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          {/* Engagement Factors */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Days Active:</span>
              <span className="font-medium">{engagement.factors.daysActive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Generations:</span>
              <span className="font-medium">{engagement.factors.generationsCreated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Features Used:</span>
              <span className="font-medium">{engagement.factors.featuresUsed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email Verified:</span>
              <span className={`font-medium ${
                engagement.factors.emailVerified ? 'text-green-600' : 'text-red-600'
              }`}>
                {engagement.factors.emailVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Social Shares:</span>
              <span className="font-medium">{engagement.factors.socialSharing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upgrade Interest:</span>
              <span className="font-medium">{engagement.factors.upgradeIntent}</span>
            </div>
          </div>

          {/* Engagement Tips */}
          {engagement.score < 60 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Boost Your Engagement</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {!engagement.factors.emailVerified && (
                  <li>• Verify your email to unlock all features</li>
                )}
                {engagement.factors.generationsCreated < 3 && (
                  <li>• Create more ad variations to discover what works</li>
                )}
                {engagement.factors.featuresUsed < 2 && (
                  <li>• Try copying, exporting, or saving your favorite ads</li>
                )}
                {engagement.factors.socialSharing === 0 && (
                  <li>• Share your best ads to get feedback</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}