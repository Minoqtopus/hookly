'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  ArrowLeft, 
  Heart,
  TrendingDown,
  Users,
  MessageSquare,
  Gift,
  Crown,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/app/lib/AppContext';
import { useUpgrade } from '@/app/lib/useUpgrade';
import Link from 'next/link';

export default function CancelSubscriptionPage() {
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showRetentionOffer, setShowRetentionOffer] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  const { isUpgrading, error, cancelSubscription } = useUpgrade();

  const cancellationReasons = [
    { id: 'cost', label: 'Too expensive', icon: TrendingDown },
    { id: 'not_using', label: 'Not using it enough', icon: Users },
    { id: 'missing_features', label: 'Missing features I need', icon: MessageSquare },
    { id: 'technical_issues', label: 'Technical problems', icon: AlertCircle },
    { id: 'found_alternative', label: 'Found a better alternative', icon: Heart },
    { id: 'other', label: 'Other reason', icon: MessageSquare }
  ];

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    
    // Show retention offer for certain reasons
    if (['cost', 'not_using'].includes(reasonId)) {
      setShowRetentionOffer(true);
    } else {
      setShowRetentionOffer(false);
    }
  };

  const handleCancel = async () => {
    setIsConfirming(true);
    const success = await cancelSubscription();
    
    if (success) {
      router.push('/upgrade/cancelled');
    } else {
      setIsConfirming(false);
    }
  };

  const retentionOffers = {
    cost: {
      title: "Wait! Get 50% Off for 3 Months",
      description: "We understand budget constraints. How about 50% off your next 3 months?",
      offer: "Continue with 50% discount",
      savings: "Save $28.50"
    },
    not_using: {
      title: "Let Us Help You Get More Value",
      description: "Our Pro success team can help you maximize your results with a free strategy call.",
      offer: "Get free Pro strategy session",
      savings: "Worth $297"
    }
  };

  if (!user || user.plan !== 'pro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h1>
          <p className="text-gray-600 mb-6">You don't have an active Pro subscription to cancel.</p>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            We're Sorry to See You Go 💔
          </h1>
          
          <p className="text-xl text-gray-600">
            Before you cancel, help us understand what went wrong so we can improve.
          </p>
        </div>

        {/* Cancellation Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why are you cancelling your Pro subscription?
          </h2>
          
          <div className="space-y-4 mb-6">
            {cancellationReasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => handleReasonSelect(reason.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedReason === reason.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <reason.icon className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="font-medium text-gray-900">{reason.label}</span>
                  {selectedReason === reason.id && (
                    <Check className="h-5 w-5 text-primary-600 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedReason && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional feedback (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us more about your experience..."
              />
            </div>
          )}
        </div>

        {/* Retention Offer */}
        {showRetentionOffer && selectedReason && retentionOffers[selectedReason as keyof typeof retentionOffers] && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <Gift className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {retentionOffers[selectedReason as keyof typeof retentionOffers].title}
              </h2>
              <p className="text-gray-700 mb-6">
                {retentionOffers[selectedReason as keyof typeof retentionOffers].description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                  {retentionOffers[selectedReason as keyof typeof retentionOffers].offer}
                  <div className="text-sm text-yellow-100 mt-1">
                    {retentionOffers[selectedReason as keyof typeof retentionOffers].savings}
                  </div>
                </button>
                <button 
                  onClick={() => setShowRetentionOffer(false)}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  No thanks, continue cancelling
                </button>
              </div>
            </div>
          </div>
        )}

        {/* What You'll Lose */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What You'll Lose When You Cancel
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Crown, title: 'Unlimited Generations', desc: 'Back to 3 ads per day limit' },
              { icon: TrendingDown, title: 'Advanced Analytics', desc: 'Limited performance insights' },
              { icon: Users, title: 'Batch Generation', desc: 'No more bulk ad creation' },
              { icon: MessageSquare, title: 'Priority Support', desc: 'Standard support response times' }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Confirmation */}
        {selectedReason && !showRetentionOffer && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Are you sure you want to cancel?
              </h2>
              <p className="text-gray-600 mb-8">
                Your subscription will remain active until the end of your current billing period. 
                You can reactivate anytime.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleCancel}
                  disabled={isUpgrading || isConfirming}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpgrading || isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel My Subscription'
                  )}
                </button>
                
                <Link 
                  href="/dashboard"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-colors text-center"
                >
                  Keep My Pro Subscription
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/help" className="text-primary-600 hover:text-primary-700 font-medium">
              📚 Help Center
            </Link>
            <Link href="mailto:support@aiugc.com" className="text-primary-600 hover:text-primary-700 font-medium">
              💬 Contact Support
            </Link>
            <Link href="/community" className="text-primary-600 hover:text-primary-700 font-medium">
              👥 Community Forum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}