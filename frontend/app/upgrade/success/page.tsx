'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Gift,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react';
import { useApp } from '@/app/lib/AppContext';
import Link from 'next/link';

function UpgradeSuccessPageContent() {
  const [showConfetti, setShowConfetti] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { actions } = useApp();

  // Hide confetti after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Refresh user data to get updated plan status
  useEffect(() => {
    actions.refreshUserData();
  }, [actions]);

  const nextSteps = [
    {
      icon: Zap,
      title: "Generate Unlimited Ads",
      description: "No more daily limits - create as many viral ads as you need",
      action: "Start Creating",
      link: "/generate"
    },
    {
      icon: TrendingUp,
      title: "Try Batch Generation",
      description: "Generate 10+ ad variations at once for A/B testing",
      action: "Try Batch Mode",
      link: "/generate?mode=batch"
    },
    {
      icon: Users,
      title: "Join Pro Community",
      description: "Access exclusive Discord community and Pro-only resources",
      action: "Join Community",
      link: "/community"
    }
  ];

  const proFeatures = [
    "✅ Unlimited ad generations",
    "✅ Advanced performance analytics",
    "✅ Batch generation (10+ ads)",
    "✅ No watermarks",
    "✅ Priority customer support",
    "✅ Custom templates & themes",
    "✅ Team collaboration features",
    "✅ API access"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-gradient-to-r ${
                  i % 4 === 0 ? 'from-yellow-400 to-orange-400' :
                  i % 4 === 1 ? 'from-green-400 to-blue-400' :
                  i % 4 === 2 ? 'from-purple-400 to-pink-400' :
                  'from-red-400 to-yellow-400'
                } rounded-full animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Pro! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Your upgrade was successful. You now have access to all Pro features!
          </p>

          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold">
            <Crown className="h-5 w-5 mr-2" />
            Pro Member - Unlimited Power Unlocked
          </div>
        </div>

        {/* What You Get */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What You Just Unlocked
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {proFeatures.map((feature, index) => (
                <div key={index} className="text-left">
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Ready to Get Started? Here's What to Do Next
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                <Link 
                  href={step.link}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Special Pro Bonus */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white mb-12">
          <Gift className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-2xl font-bold mb-4">🎁 Special Pro Welcome Bonus!</h2>
          <p className="text-primary-100 mb-6">
            As a new Pro member, you get exclusive access to our Advanced AI Models and 
            Premium Template Library worth $97 - absolutely free!
          </p>
          <Link 
            href="/templates"
            className="inline-flex items-center bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-shadow"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Explore Premium Templates
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Link 
            href="/generate"
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6 rounded-xl text-center hover:shadow-lg transition-shadow group"
          >
            <Zap className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-2">Start Creating Unlimited Ads</h3>
            <p className="text-primary-100 text-sm">Jump right in and create your first unlimited ad</p>
          </Link>
          
          <Link 
            href="/dashboard"
            className="bg-white border-2 border-gray-200 text-gray-700 p-6 rounded-xl text-center hover:shadow-lg hover:border-primary-300 transition-all group"
          >
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-2">View Your Pro Dashboard</h3>
            <p className="text-gray-600 text-sm">Check out your enhanced analytics and features</p>
          </Link>
        </div>

        {/* Support Section */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help Getting Started?</h3>
          <p className="text-gray-600 mb-4">
            Our Pro support team is here to help you make the most of your new features.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/help"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              📚 Pro User Guide
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href="mailto:pro-support@aiugc.com"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              💬 Contact Pro Support
            </Link>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Excited about your upgrade? Share the news!</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Share on Twitter
            </button>
            <button className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
              Share on LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <UpgradeSuccessPageContent />
    </Suspense>
  );
}