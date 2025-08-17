'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Play, ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { useGeneration } from '@/app/lib/useGeneration';
import AuthModal from '@/app/components/AuthModal';
import SocialProofLoader from '@/app/components/SocialProofLoader';
import ScarcityIndicator from '@/app/components/ScarcityIndicator';
import Link from 'next/link';

export default function HomePage() {
  const [showDemo, setShowDemo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTrigger, setAuthTrigger] = useState<'demo_save' | 'try_again' | 'nav_signup'>('demo_save');
  const [demoData, setDemoData] = useState({
    productName: 'Fitness Protein Powder',
    niche: 'Health & Fitness',
    targetAudience: 'Fitness enthusiasts aged 25-35',
    generatedAd: null as any
  });

  const { isGenerating, generatedAd, generateGuestAd, clearGeneration } = useGeneration();

  // Auto-start demo on page load for immediate engagement
  useEffect(() => {
    const timer = setTimeout(() => setShowDemo(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTryDemo = () => {
    // Start demo timer in sessionStorage
    const DEMO_TIMER_KEY = 'demo_timer_start';
    const DEMO_DURATION = 300; // 5 minutes in seconds
    
    sessionStorage.setItem(DEMO_TIMER_KEY, Date.now().toString());
    sessionStorage.setItem('demo_duration', DEMO_DURATION.toString());
    
    // Store demo data for the generation page
    sessionStorage.setItem('demo_data', JSON.stringify(demoData));
    
    // Navigate to generate page with demo parameters
    window.location.href = `/generate?demo=true&timer=${DEMO_DURATION}`;
  };

  const handleSaveAd = () => {
    setAuthTrigger('demo_save');
    setShowAuthModal(true);
  };

  const handleTryAgain = () => {
    setAuthTrigger('try_again');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section - Mobile First */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Hookly</span>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </Link>
              <button 
                onClick={() => {
                  setAuthTrigger('nav_signup');
                  setShowAuthModal(true);
                }}
                className="btn-primary text-sm px-4 py-2"
              >
                Sign Up Free
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center bg-primary-50 rounded-full px-4 py-2 mb-4">
              <Star className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">
                Trusted by 10,000+ creators • 4.9/5 rating
              </span>
            </div>

            {/* Scarcity Indicator */}
            <div className="flex justify-center mb-6">
              <ScarcityIndicator type="users_online" size="medium" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Viral TikTok Ads
              </span>
              <br />
              in 30 Seconds
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI-powered UGC ad scripts, hooks, and visual prompts that actually convert. 
              No marketing experience needed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={handleTryDemo}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Try Free Demo
                  </>
                )}
              </button>
              <Link href="/examples" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
                See Examples
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No signup required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Results in 30 seconds
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Mobile optimized
              </div>
            </div>
          </div>
        </div>

        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-secondary-100/20 transform skew-y-1"></div>
        </div>
      </div>

      {/* Live Demo Section */}
      {showDemo && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Watch AI Create Your Ad
              </h2>
              <p className="text-gray-600">
                See how our AI generates viral-ready content in real-time
              </p>
            </div>

            {/* Demo Form */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Fitness Protein Powder"
                    className="input-field"
                    defaultValue="Fitness Protein Powder"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niche
                  </label>
                  <input 
                    type="text" 
                    placeholder="Health & Fitness"
                    className="input-field"
                    defaultValue="Health & Fitness"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input 
                    type="text" 
                    placeholder="Fitness enthusiasts aged 25-35"
                    className="input-field"
                    defaultValue="Fitness enthusiasts aged 25-35"
                  />
                </div>
                <button 
                  onClick={handleTryDemo}
                  className="btn-primary w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate My Ad'}
                </button>
              </div>

              {/* Demo Results */}
              <div id="demo-results" className="space-y-4">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-64">
                    <SocialProofLoader size="large" />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🎯 Hook</h4>
                      <p className="text-gray-700 italic">
                        {generatedAd?.hook || demoData.generatedAd?.hook || "I was skeptical about protein powders until I tried this one thing..."}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📜 Script</h4>
                      <p className="text-gray-700">
                        {generatedAd?.script || demoData.generatedAd?.script || "Okay guys, I need to share this because it's actually insane. I've been trying different protein powders for months and nothing was giving me the results I wanted. Then my trainer recommended this one and within 2 weeks I could see the difference..."}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🎬 Visual Prompts</h4>
                      <ul className="text-gray-700 space-y-1">
                        {(generatedAd?.visuals || demoData.generatedAd?.visuals || [
                          "Close-up of mixing the protein shake",
                          "Before/after transformation shots",
                          "Workout montage with energy boost",
                          "Product placement on kitchen counter"
                        ]).map((visual: string, index: number) => (
                          <li key={index}>• {visual}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Upgrade Prompt */}
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Love this ad?</p>
                          <p className="text-sm text-gray-600">Sign up to save and create unlimited ads!</p>
                        </div>
                        <button 
                          onClick={handleSaveAd}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Save & Continue
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Top Creators
            </h2>
            <p className="text-gray-600">
              Join thousands who've generated millions in ad revenue
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { metric: "50M+", label: "Views Generated", icon: TrendingUp },
              { metric: "$2.3M", label: "Revenue Created", icon: Star },
              { metric: "10,000+", label: "Happy Creators", icon: CheckCircle },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.metric}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        demoData={{
          ...demoData,
          generatedAd: generatedAd || demoData.generatedAd
        }}
        triggerSource={authTrigger}
      />
    </div>
  );
}