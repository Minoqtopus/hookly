'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Heart,
  ArrowRight,
  Star,
  Gift,
  Mail,
  Calendar
} from 'lucide-react';
import { useApp } from '@/app/lib/AppContext';
import Link from 'next/link';

export default function CancelledPage() {
  const router = useRouter();
  const { actions } = useApp();

  // Refresh user data to get updated plan status
  useEffect(() => {
    actions.refreshUserData();
  }, [actions]);

  const freeFeatures = [
    "3 ad generations per day",
    "Basic performance insights", 
    "Standard templates",
    "Community support",
    "Watermarked exports"
  ];

  const winBackOffers = [
    {
      title: "50% Off for 3 Months",
      description: "Come back anytime with this special discount",
      code: "COMEBACK50",
      expires: "Valid until December 31st"
    },
    {
      title: "Free Pro Strategy Session",
      description: "1-on-1 session to maximize your ad performance",
      value: "Worth $297",
      action: "Book Now"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Subscription Cancelled
          </h1>
          
          <p className="text-xl text-gray-600">
            Your Pro subscription has been cancelled. You'll continue to have Pro access until the end of your billing period.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Current Status</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Pro Access Continues</h3>
              <p className="text-gray-600 mb-4">
                You'll keep all Pro features until your billing period ends.
              </p>
              <div className="flex items-center text-blue-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Access until: January 15, 2024</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">After Expiration</h3>
              <p className="text-gray-600 mb-4">
                Your account will automatically switch to our Free plan.
              </p>
              <div className="space-y-1">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    • {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Win-back Offers */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              We'd Love to Have You Back
            </h2>
            <p className="text-gray-600">
              Here are some special offers just for you - available anytime you're ready to return.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {winBackOffers.map((offer, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                
                {offer.code && (
                  <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm font-mono mb-3">
                    Code: {offer.code}
                  </div>
                )}
                
                {offer.value && (
                  <div className="text-green-600 font-medium text-sm mb-3">
                    {offer.value}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mb-4">
                  {offer.expires || 'No expiration'}
                </div>
                
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  {offer.action || 'Claim Offer'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Thank You */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <Star className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Thank You for Your Feedback
            </h2>
            <p className="text-gray-600 mb-6">
              Your input helps us improve AI UGC for everyone. We'll use your feedback to make the product better.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                💡 <strong>Good news:</strong> We're already working on the features you mentioned! 
                Keep an eye on your email for updates about new releases.
              </p>
            </div>
          </div>
        </div>

        {/* Stay Connected */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Stay Connected
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Newsletter</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get updates on new features and special offers
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Stay Subscribed
              </button>
            </div>
            
            <div className="text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600 text-sm mb-4">
                Join our free community of creators
              </p>
              <Link href="/community" className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                Join Community
              </Link>
            </div>
            
            <div className="text-center">
              <Gift className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Free Resources</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access our library of free ad templates
              </p>
              <Link href="/resources" className="text-green-600 hover:text-green-700 font-medium text-sm">
                Browse Resources
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Changed Your Mind?
          </h2>
          <p className="text-gray-600 mb-6">
            You can reactivate your Pro subscription anytime with just one click.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/upgrade"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-flex items-center justify-center"
            >
              Reactivate Pro
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            
            <Link 
              href="/dashboard"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Continue with Free
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Questions about your cancellation or account?
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/help" className="text-primary-600 hover:text-primary-700 font-medium">
              📚 Help Center
            </Link>
            <Link href="mailto:support@aiugc.com" className="text-primary-600 hover:text-primary-700 font-medium">
              💬 Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}