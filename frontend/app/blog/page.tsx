'use client';

import { Calendar, Clock, Eye, Heart, MessageCircle, Tag, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AppContext';
import { AnalyticsService, EventType } from '../lib/analytics';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  category: string;
  tags: string[];
  featured_image: string;
  published_at: string;
  updated_at: string;
  reading_time: number;
  views: number;
  likes: number;
  comments: number;
  is_sponsored: boolean;
  sponsor?: {
    name: string;
    logo: string;
    url: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    og_image: string;
  };
}

interface BlogStats {
  total_posts: number;
  total_views: number;
  total_subscribers: number;
  monthly_revenue: number;
  sponsored_posts: number;
  average_engagement: number;
}

export default function BlogPage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [stats, setStats] = useState<BlogStats>({
    total_posts: 0,
    total_views: 0,
    total_subscribers: 0,
    monthly_revenue: 0,
    sponsored_posts: 0,
    average_engagement: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'all',
    'viral-strategies',
    'case-studies',
    'platform-updates',
    'creator-interviews',
    'industry-news',
    'sponsored-content'
  ];

  useEffect(() => {
    loadBlogData();
    
    // Track page view
    AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
      eventData: {
        page: 'blog',
        user_authenticated: isAuthenticated,
        user_plan: user?.plan
      }
    });
  }, [isAuthenticated, user]);

  const loadBlogData = async () => {
    setIsLoading(true);
    
    try {
      // Load blog stats (mock data for now)
      setStats({
        total_posts: 127,
        total_views: 245000,
        total_subscribers: 8934,
        monthly_revenue: 12500,
        sponsored_posts: 18,
        average_engagement: 7.8
      });

      // Mock blog posts data
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'How Sarah Generated 2.3M Views with One TikTok Hook Formula',
          slug: 'sarah-2-3m-views-tiktok-hook-formula',
          excerpt: 'Discover the exact hook formula that helped Sarah Martinez go from 10K to 2.3M views in just 30 days. This case study breaks down every element of her viral strategy.',
          content: '...',
          author: {
            name: 'Alex Rodriguez',
            avatar: '/api/placeholder/40/40',
            bio: 'Viral content strategist with 5+ years experience'
          },
          category: 'case-studies',
          tags: ['tiktok', 'hooks', 'viral-strategy', 'case-study'],
          featured_image: '/api/placeholder/600/300',
          published_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          reading_time: 8,
          views: 15420,
          likes: 342,
          comments: 28,
          is_sponsored: false,
          seo: {
            meta_title: 'TikTok Hook Formula: 2.3M Views Case Study | Hookly Blog',
            meta_description: 'Learn the exact hook formula that generated 2.3M TikTok views. Complete case study with actionable insights.',
            canonical_url: 'https://hookly.ai/blog/sarah-2-3m-views-tiktok-hook-formula',
            og_image: '/api/placeholder/1200/630'
          }
        },
        {
          id: '2',
          title: 'Instagram Algorithm Update: What Creators Need to Know in 2025',
          slug: 'instagram-algorithm-update-2025-creators',
          excerpt: 'Instagram just rolled out major algorithm changes that affect how content is distributed. Here\'s what every creator needs to know to maintain their reach.',
          content: '...',
          author: {
            name: 'Maria Chen',
            avatar: '/api/placeholder/40/40',
            bio: 'Social media analyst and Instagram growth expert'
          },
          category: 'platform-updates',
          tags: ['instagram', 'algorithm', 'creators', '2025'],
          featured_image: '/api/placeholder/600/300',
          published_at: '2025-01-12T14:30:00Z',
          updated_at: '2025-01-12T14:30:00Z',
          reading_time: 6,
          views: 8930,
          likes: 156,
          comments: 42,
          is_sponsored: false,
          seo: {
            meta_title: 'Instagram Algorithm Update 2025: Creator Guide | Hookly',
            meta_description: 'Stay ahead of Instagram\'s 2025 algorithm changes. Essential guide for creators to maintain and grow their reach.',
            canonical_url: 'https://hookly.ai/blog/instagram-algorithm-update-2025-creators',
            og_image: '/api/placeholder/1200/630'
          }
        },
        {
          id: '3',
          title: 'The Complete Guide to Viral Video Editing (Sponsored by CapCut Pro)',
          slug: 'complete-guide-viral-video-editing-capcut',
          excerpt: 'Master the art of viral video editing with proven techniques and tools. This comprehensive guide covers everything from basic cuts to advanced effects.',
          content: '...',
          author: {
            name: 'Jake Thompson',
            avatar: '/api/placeholder/40/40',
            bio: 'Video editor and content creation expert'
          },
          category: 'sponsored-content',
          tags: ['video-editing', 'capcut', 'viral-videos', 'tutorial'],
          featured_image: '/api/placeholder/600/300',
          published_at: '2025-01-10T09:15:00Z',
          updated_at: '2025-01-10T09:15:00Z',
          reading_time: 12,
          views: 22100,
          likes: 487,
          comments: 73,
          is_sponsored: true,
          sponsor: {
            name: 'CapCut Pro',
            logo: '/api/placeholder/120/40',
            url: 'https://capcut.com/pro'
          },
          seo: {
            meta_title: 'Viral Video Editing Guide: Master CapCut Pro | Hookly',
            meta_description: 'Complete guide to viral video editing with CapCut Pro. Learn professional techniques for creating engaging content.',
            canonical_url: 'https://hookly.ai/blog/complete-guide-viral-video-editing-capcut',
            og_image: '/api/placeholder/1200/630'
          }
        }
      ];

      setPosts(mockPosts);
      setFeaturedPost(mockPosts[0]);

    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    // Track blog post engagement
    AnalyticsService.trackEvent(EventType.PAGE_VIEW, {
      eventData: {
        page: 'blog_post',
        post_id: post.id,
        post_title: post.title,
        post_category: post.category,
        is_sponsored: post.is_sponsored,
        user_plan: user?.plan
      }
    });
  };

  const handleLikePost = (postId: string) => {
    // Track like interaction
    AnalyticsService.trackEvent(EventType.COPY_TO_CLIPBOARD, {
      eventData: {
        interaction_type: 'blog_post_like',
        post_id: postId,
        source: 'blog_page'
      }
    });

    // Update post likes (in real app, this would be an API call)
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📝 Hookly Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Viral content strategies, creator insights, and industry trends. 
              Learn from the best and stay ahead of the curve.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Blog Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Blog Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <MessageCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.total_posts}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Eye className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.total_views.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <User className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.total_subscribers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Subscribers</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">${stats.monthly_revenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Tag className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.sponsored_posts}</div>
              <div className="text-sm text-gray-600">Sponsored Posts</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.average_engagement}%</div>
              <div className="text-sm text-gray-600">Avg Engagement</div>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Post</h2>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={featuredPost.featured_image} 
                    alt={featuredPost.title}
                    className="h-64 w-full object-cover md:h-full"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  {featuredPost.is_sponsored && (
                    <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mb-4">
                      Sponsored Content
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h3>
                  <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <img 
                        src={featuredPost.author.avatar} 
                        alt={featuredPost.author.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{featuredPost.author.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(featuredPost.published_at).toLocaleDateString()} • {featuredPost.reading_time} min read
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {featuredPost.views.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {featuredPost.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {featuredPost.comments}
                      </div>
                    </div>
                    
                    <Link 
                      href={`/blog/${featuredPost.slug}`}
                      onClick={() => handlePostClick(featuredPost)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="h-48 w-full object-cover"
              />
              
              <div className="p-6">
                {post.is_sponsored && (
                  <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mb-3">
                    Sponsored
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(post.published_at).toLocaleDateString()}
                  <Clock className="h-4 w-4 ml-3 mr-1" />
                  {post.reading_time} min read
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-700">{post.author.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center hover:text-red-500 transition-colors"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </button>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.views.toLocaleString()}
                    </div>
                  </div>
                  
                  <Link 
                    href={`/blog/${post.slug}`}
                    onClick={() => handlePostClick(post)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Never Miss a Viral Strategy
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get the latest viral content strategies, case studies, and platform updates 
            delivered directly to your inbox. Join thousands of successful creators.
          </p>
          <Link 
            href="/newsletter"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Subscribe to Newsletter 📧
          </Link>
        </div>
      </div>
    </div>
  );
}
