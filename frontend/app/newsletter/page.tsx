'use client';

import { Check, Crown, Mail, Star, TrendingUp, Users, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AppContext';
import { AnalyticsService, EventType } from '../lib/analytics';
import { toast } from '../lib/toast';

interface NewsletterSubscription {
  id: string;
  email: string;
  tier: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'pending';
  subscribed_at: string;
  expires_at?: string;
  preferences: {
    content_tips: boolean;
    viral_trends: boolean;
    case_studies: boolean;
    product_updates: boolean;
    sponsored_content: boolean;
  };
}

interface NewsletterStats {
  total_subscribers: number;
  premium_subscribers: number;
  monthly_revenue: number;
  open_rate: number;
  click_rate: number;
  growth_rate: number;
}

export default function NewsletterPage() {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<NewsletterSubscription | null>(null);
  const [stats, setStats] = useState<NewsletterStats>({
    total_subscribers: 0,
    premium_subscribers: 0,
    monthly_revenue: 0,
    open_rate: 0,
    click_rate: 0,
    growth_rate: 0
  });
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    // Load newsletter data
    loadNewsletterData();
    
    // Track page view
    AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
      eventData: {
        page: 'newsletter',
        user_authenticated: isAuthenticated,
        user_plan: user?.plan
      }
    });
  }, [isAuthenticated, user]);

  const loadNewsletterData = async () => {
    try {
      // Load user subscription if authenticated
      if (isAuthenticated && user) {
        // This would be an API call in a real implementation
        // const response = await ApiClient.get('/newsletter/subscription');
        // setSubscription(response.subscription);
      }

      // Load newsletter stats (mock data for now)
      setStats({
        total_subscribers: 2847,
        premium_subscribers: 423,
        monthly_revenue: 6345,
        open_rate: 42.3,
        click_rate: 8.7,
        growth_rate: 15.2
      });
    } catch (error) {
      console.error('Failed to load newsletter data:', error);
    }
  };

  const handleSubscribe = async (tier: 'free' | 'premium') => {
    setIsLoading(true);
    
    try {
      const subscriptionData = {
        email: email || user?.email,
        tier,
        preferences: {
          content_tips: true,
          viral_trends: true,
          case_studies: true,
          product_updates: true,
          sponsored_content: tier === 'premium'
        }
      };

      // This would be an API call in a real implementation
      // const response = await ApiClient.post('/newsletter/subscribe', subscriptionData);
      
      // Mock successful subscription
      const mockSubscription: NewsletterSubscription = {
        id: `sub_${Date.now()}`,
        email: subscriptionData.email || '',
        tier,
        status: 'active',
        subscribed_at: new Date().toISOString(),
        expires_at: tier === 'premium' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        preferences: subscriptionData.preferences
      };

      setSubscription(mockSubscription);

      // Track subscription event
      AnalyticsService.trackEvent(EventType.UPGRADE_COMPLETED, {
        eventData: {
          subscription_type: 'newsletter',
          tier,
          price: tier === 'premium' ? 15 : 0,
          source: 'newsletter_page'
        }
      });

      toast.success(
        tier === 'premium' 
          ? 'Welcome to Hookly Premium Newsletter! 🎉' 
          : 'Successfully subscribed to Hookly Newsletter! 📧'
      );

      // If premium, redirect to payment
      if (tier === 'premium') {
        // This would redirect to payment processing
        toast.info('Redirecting to secure payment...');
      }

    } catch (error) {
      console.error('Subscription failed:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription) return;

    try {
      // This would be an API call in a real implementation
      // await ApiClient.delete(`/newsletter/subscription/${subscription.id}`);
      
      setSubscription(null);
      toast.success('Successfully unsubscribed from newsletter.');

      // Track unsubscription event
      AnalyticsService.trackEvent(EventType.SUBSCRIPTION_CANCELLED, {
        eventData: {
          subscription_type: 'newsletter',
          tier: subscription.tier,
          duration_days: Math.floor((new Date().getTime() - new Date(subscription.subscribed_at).getTime()) / (1000 * 60 * 60 * 24))
        }
      });

    } catch (error) {
      console.error('Unsubscription failed:', error);
      toast.error('Failed to unsubscribe. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📧 Hookly Newsletter
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get exclusive viral content strategies, industry insights, and proven tactics 
              that help creators and businesses go viral. Join thousands of successful content creators.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Newsletter Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Newsletter Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.total_subscribers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Subscribers</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Crown className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.premium_subscribers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Premium Members</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">${stats.monthly_revenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.open_rate}%</div>
              <div className="text-sm text-gray-600">Open Rate</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Zap className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.click_rate}%</div>
              <div className="text-sm text-gray-600">Click Rate</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Star className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">+{stats.growth_rate}%</div>
              <div className="text-sm text-gray-600">Monthly Growth</div>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    {subscription.tier === 'premium' ? '👑 Premium Subscriber' : '📧 Free Subscriber'}
                  </h3>
                  <p className="text-green-700">
                    Subscribed since {new Date(subscription.subscribed_at).toLocaleDateString()}
                    {subscription.expires_at && ` • Expires ${new Date(subscription.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={handleUnsubscribe}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        {!subscription && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Choose Your Newsletter Experience</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Newsletter */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
                <div className="text-center mb-6">
                  <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">Free Newsletter</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">Free</div>
                  <p className="text-gray-600 mt-2">Essential viral content insights</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Weekly viral content tips</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Trending platform updates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic case studies</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Product updates</span>
                  </li>
                  <li className="flex items-center">
                    <X className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-500">Premium case studies</span>
                  </li>
                  <li className="flex items-center">
                    <X className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-500">Exclusive interviews</span>
                  </li>
                  <li className="flex items-center">
                    <X className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-500">Advanced strategies</span>
                  </li>
                </ul>
                
                <button
                  onClick={() => handleSubscribe('free')}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </div>

              {/* Premium Newsletter */}
              <div className="bg-white rounded-lg border-2 border-purple-500 p-8 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                
                <div className="text-center mb-6">
                  <Crown className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">Premium Newsletter</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    $15<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600 mt-2">Advanced viral strategies & exclusive content</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Everything in Free</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Premium case studies</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Exclusive creator interviews</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced viral strategies</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Revenue optimization tips</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Early access to features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Direct creator support</span>
                  </li>
                </ul>
                
                <button
                  onClick={() => handleSubscribe('premium')}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Processing...' : 'Subscribe Premium'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Signup Form (for non-authenticated users) */}
        {!isAuthenticated && !subscription && (
          <div className="mb-12">
            <div className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSubscribe(selectedTier)}
                  disabled={!email || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Subscribe
                </button>
              </div>
              
              <div className="flex items-center justify-center mt-4 space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tier"
                    value="free"
                    checked={selectedTier === 'free'}
                    onChange={() => setSelectedTier('free')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Free</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tier"
                    value="premium"
                    checked={selectedTier === 'premium'}
                    onChange={() => setSelectedTier('premium')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Premium ($15/month)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Content Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What You'll Get</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <TrendingUp className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Viral Strategies</h3>
              <p className="text-gray-600">
                Learn the latest viral content strategies that top creators use to get millions of views. 
                From hook formulas to trending topics.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Star className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Case Studies</h3>
              <p className="text-gray-600">
                Deep dives into viral campaigns that generated millions in revenue. Learn what worked, 
                what didn't, and how to apply it.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Zap className="h-8 w-8 text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Updates</h3>
              <p className="text-gray-600">
                Stay ahead of algorithm changes, new features, and platform trends. Get insider insights 
                before your competitors.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Subscribers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Sarah Martinez</div>
                  <div className="text-gray-600 text-sm">Content Creator</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The premium newsletter helped me increase my TikTok views by 300% in just 2 months. 
                The strategies are actionable and actually work!"
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  MJ
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Mike Johnson</div>
                  <div className="text-gray-600 text-sm">Marketing Agency Owner</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "I've tried many newsletters, but Hookly's insights are game-changing. Our client campaigns 
                now consistently go viral thanks to their strategies."
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  LC
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Lisa Chen</div>
                  <div className="text-gray-600 text-sm">E-commerce Brand</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The premium case studies are worth the subscription alone. I've implemented 3 strategies 
                that generated over $50K in additional revenue."
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How often do you send newsletters?</h3>
              <p className="text-gray-600">
                Free subscribers receive weekly newsletters with essential updates. Premium subscribers get 
                additional mid-week insights and exclusive content.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my premium subscription anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your premium subscription at any time. You'll continue to receive premium 
                content until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What makes the premium content different?</h3>
              <p className="text-gray-600">
                Premium content includes detailed case studies, exclusive creator interviews, advanced strategies, 
                and direct access to our content team for personalized advice.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for premium subscriptions. If you're not satisfied, 
                contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
