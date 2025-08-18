'use client';

import { useState, useEffect } from 'react';
import { Copy, Star, TrendingUp, Sparkles, Filter, Heart } from 'lucide-react';
import { toast } from '../lib/toast';
import { ApiClient } from '../lib/api';

interface Template {
  id: string;
  title: string;
  niche: string;
  targetAudience: string;
  hook: string;
  script: string;
  visuals: string[];
  performance: {
    estimatedViews: number;
    estimatedCTR: number;
    viralScore: number;
  };
  tags: string[];
  isPopular?: boolean;
}

interface TemplateLibraryProps {
  onUseTemplate?: (template: Template) => void;
  showFilters?: boolean;
  compact?: boolean;
  externalFilter?: string;
}

// Fallback templates in case API fails
const fallbackTemplates: Template[] = [
  {
    id: '1',
    title: 'Skincare Transformation',
    niche: 'Beauty',
    targetAudience: 'Women aged 25-45 with skin concerns',
    hook: 'I used to hide my acne with 5 layers of makeup until I found this one ingredient...',
    script: `I used to hide my acne with 5 layers of makeup until I found this one ingredient...

*holds up product*

This serum changed everything. Look at my skin now - no filter, no makeup.

*shows before/after photos*

The secret? It has 2% salicylic acid that actually penetrates your pores, unlike those drugstore products that just sit on top.

I've been using it for 3 months and people keep asking if I got professional treatments.

*applies product to face*

The best part? It's only $29 and lasts forever. Link in my bio - but hurry, they're doing 30% off this week only.

Trust me, your future self will thank you.`,
    visuals: [
      'Close-up of applying makeup to cover acne',
      'Holding the serum product with confident smile',
      'Split-screen before/after transformation',
      'Detailed product application on clean face',
      'Final result - glowing, clear skin'
    ],
    performance: {
      estimatedViews: 156000,
      estimatedCTR: 4.8,
      viralScore: 8.9
    },
    tags: ['skincare', 'transformation', 'before-after'],
    isPopular: true
  },
  {
    id: '2',
    title: 'Protein Powder Results',
    niche: 'Fitness',
    targetAudience: 'Gym enthusiasts and athletes aged 20-40',
    hook: 'My trainer said I\'d never build muscle as a vegetarian. Then I found this...',
    script: `My trainer said I'd never build muscle as a vegetarian. Then I found this...

*flexes in gym mirror*

This plant-based protein has 30g per scoop - more than most whey proteins.

*shows transformation photos*

6 months ago I was 140lbs and weak. Now I'm 165lbs of lean muscle.

*scoops protein powder*

The difference? This has all 9 essential amino acids that your body can't make. Most plant proteins are incomplete.

Plus it tastes like a vanilla milkshake - not like grass clippings.

*drinks shake*

I'm not saying ditch the gym, but having the right fuel makes all the difference.

Use my code GAINS20 for 20% off your first order.`,
    visuals: [
      'Disappointed face talking to trainer',
      'Flexing progress in gym mirror',
      'Side-by-side transformation photos',
      'Scooping protein powder into shaker',
      'Enjoying the protein shake post-workout'
    ],
    performance: {
      estimatedViews: 89000,
      estimatedCTR: 3.6,
      viralScore: 7.4
    },
    tags: ['fitness', 'transformation', 'plant-based']
  },
  {
    id: '3',
    title: 'Productivity App Secret',
    niche: 'Tech/Productivity',
    targetAudience: 'Busy professionals and students aged 22-35',
    hook: 'I was working 70-hour weeks until I discovered this productivity hack...',
    script: `I was working 70-hour weeks until I discovered this productivity hack...

*shows chaotic desk with multiple screens*

My life was complete chaos. Meetings, deadlines, constant stress.

*opens phone app*

Then I found this app that uses the Pomodoro Technique with AI optimization.

*shows clean, organized workspace*

It analyzes when you're most productive and schedules your hardest tasks for those peak hours.

*demonstrates app features*

Now I finish everything by 5 PM and actually have a life.

The crazy part? It's free for basic features, and Pro is only $5/month.

*relaxing at home in evening*

Downloaded it 3 months ago and my productivity increased by 340%. Not kidding.

Link in bio - your future self will thank you.`,
    visuals: [
      'Messy desk with stressed person working late',
      'Phone screen showing the productivity app',
      'Clean, organized workspace transformation',
      'App interface with scheduling features',
      'Person relaxing at home in evening light'
    ],
    performance: {
      estimatedViews: 234000,
      estimatedCTR: 5.2,
      viralScore: 9.1
    },
    tags: ['productivity', 'app', 'work-life-balance'],
    isPopular: true
  },
  {
    id: '4',
    title: 'Coffee Shop Marketing',
    niche: 'Food & Beverage',
    targetAudience: 'Coffee lovers and local business supporters aged 25-50',
    hook: 'This local coffee shop was about to close until they tried one simple marketing trick...',
    script: `This local coffee shop was about to close until they tried one simple marketing trick...

*sad empty coffee shop*

Sarah's Café was my favorite spot, but hardly anyone knew about it.

*shows owner looking worried*

The owner Sarah was about to shut down after 10 years.

*lightbulb moment*

Then I suggested she start posting her latte art on TikTok.

*filming latte art creation process*

She went from 50 followers to 10K in two months.

*busy coffee shop with lines*

Now there's a line out the door every morning.

*happy customers with beautiful lattes*

The secret? People don't just buy coffee - they buy the experience.

*Sarah smiling behind counter*

Sometimes the best marketing is just showing people what you're passionate about.

Support your local businesses - they need us now more than ever.`,
    visuals: [
      'Empty coffee shop with sad atmosphere',
      'Owner looking worried behind counter',
      'Close-up of beautiful latte art being made',
      'Phone filming the latte art process',
      'Busy coffee shop with happy customers'
    ],
    performance: {
      estimatedViews: 67000,
      estimatedCTR: 2.8,
      viralScore: 6.3
    },
    tags: ['local-business', 'coffee', 'marketing']
  },
  {
    id: '5',
    title: 'Study Technique Revolution',
    niche: 'Education',
    targetAudience: 'Students aged 16-25 struggling with academics',
    hook: 'I went from failing to straight A\'s using this ancient study technique...',
    script: `I went from failing to straight A's using this ancient study technique...

*shows failed test papers*

Last semester I was on academic probation. My GPA was 1.8.

*stressed student cramming*

I was pulling all-nighters, drinking energy drinks, memorizing everything.

*discovers technique*

Then my professor mentioned the Feynman Technique - used by Nobel Prize winners.

*explains on whiteboard*

Instead of memorizing, you explain concepts in simple terms like you're teaching a 5-year-old.

*teaching to camera*

If you can't explain it simply, you don't understand it.

*shows improved grades*

This semester? 3.9 GPA. No all-nighters. No stress.

*confident student*

The trick isn't studying harder - it's studying smarter.

Try this for one week and watch your grades transform.`,
    visuals: [
      'Stack of failed tests with red marks',
      'Stressed student surrounded by books at 3 AM',
      'Writing the Feynman Technique on whiteboard',
      'Teaching concept to camera enthusiastically',
      'Showing straight A report card with pride'
    ],
    performance: {
      estimatedViews: 312000,
      estimatedCTR: 6.1,
      viralScore: 8.7
    },
    tags: ['education', 'study-tips', 'academic-success'],
    isPopular: true
  }
];

export default function TemplateLibrary({ onUseTemplate, showFilters = true, compact = false, externalFilter }: TemplateLibraryProps) {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch templates based on component requirements
        if (compact) {
          // For compact view, get popular templates
          const popularTemplates = await ApiClient.getPopularTemplates(3);
          setTemplates(popularTemplates);
        } else {
          // For full view, get all templates with filtering
          const response = await ApiClient.getTemplates({
            limit: 20,
            offset: 0
          });
          setTemplates(response.templates);
          
          // Fetch categories for filter dropdown
          const categoriesData = await ApiClient.getTemplateCategories();
          const categoryNames = categoriesData.map(cat => cat.category);
          setCategories(['all', ...categoryNames]);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        setError('Failed to load templates. Using cached templates.');
        // Fallback to hardcoded templates on error
        setTemplates(fallbackTemplates);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [compact]);

  const niches = categories.length > 1 ? categories : ['all', ...Array.from(new Set(templates.map(t => t.niche)))];
  
  // Use external filter if provided, otherwise use internal filter
  const activeFilter = externalFilter || selectedNiche;
  const filteredTemplates = activeFilter === 'all' 
    ? templates 
    : templates.filter(t => t.niche.toLowerCase().includes(activeFilter.toLowerCase()));

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Track template usage
      await ApiClient.trackTemplateUsage(template.id);
    } catch (err) {
      console.error('Failed to track template usage:', err);
      // Don't block the user flow if tracking fails
    }
    
    // Call the original onUseTemplate callback
    onUseTemplate?.(template);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">✨ Popular Templates</h3>
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading templates...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-2">
            <p className="text-xs text-amber-600">{error}</p>
          </div>
        )}
        
        {!loading && (
          <div className="grid gap-3">
            {templates.slice(0, 3).map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{template.title}</h4>
                  <p className="text-xs text-gray-500">{template.niche} • {template.performance.estimatedViews / 1000}K views</p>
                </div>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-medium hover:bg-primary-200"
                >
                  Use
                </button>
              </div>
              <p className="text-sm text-gray-600 italic">"{template.hook}"</p>
            </div>
          ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
          <p className="text-gray-600">Pre-made viral ad templates to inspire your creations</p>
        </div>
      </div>

      {/* Filters - only show if no external filter and showFilters is true */}
      {showFilters && !externalFilter && (
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {niches.map(niche => (
              <option key={niche} value={niche}>
                {niche === 'all' ? 'All Niches' : niche}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading templates...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-6">
          <p className="text-amber-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500">Showing cached templates</p>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{template.title}</h3>
                  {template.isPopular && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Popular</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{template.niche} • {template.targetAudience}</p>
              </div>
              <button
                onClick={() => toggleFavorite(template.id)}
                className={`p-1 rounded ${favorites.has(template.id) ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart className={`h-4 w-4 ${favorites.has(template.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{(template.performance.estimatedViews / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{template.performance.estimatedCTR}%</div>
                <div className="text-xs text-gray-500">CTR</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{template.performance.viralScore}/10</div>
                <div className="text-xs text-gray-500">Viral Score</div>
              </div>
            </div>

            {/* Hook Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Hook</h4>
              <p className="text-sm text-gray-700 italic">"{template.hook}"</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <Sparkles className="h-4 w-4 inline mr-1" />
                Use Template
              </button>
              <button
                onClick={() => copyToClipboard(template.hook, 'Hook')}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}