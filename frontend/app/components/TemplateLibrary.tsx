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
        setError('Failed to load templates from server.');
        // No more hardcoded fallbacks - show empty state
        setTemplates([]);
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
          <div className="text-center py-4">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <p className="text-xs text-gray-500">Templates will be available once seeded.</p>
          </div>
        )}
        
        {!loading && templates.length === 0 && !error && (
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No templates available</p>
            <p className="text-xs text-gray-400">Templates need to be seeded first</p>
          </div>
        )}
        
        {!loading && templates.length > 0 && (
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
      {!externalFilter && showFilters && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by niche:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {niches.map((niche) => (
              <button
                key={niche}
                onClick={() => setSelectedNiche(niche)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedNiche === niche
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {niche === 'all' ? 'All' : niche}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <p className="text-gray-500 text-sm">Templates need to be seeded in the database first.</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && templates.length === 0 && !error && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
          <p className="text-gray-600">Templates need to be seeded in the database first.</p>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-300">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{template.niche}</span>
                    {template.isPopular && (
                      <div className="flex items-center text-orange-500">
                        <Star className="h-3 w-3 mr-1" />
                        <span className="text-xs">Popular</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(template.id)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Heart className={`h-4 w-4 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Hook Preview */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 italic line-clamp-2">"{template.hook}"</p>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-bold text-green-600">{(template.performance.estimatedViews / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">{template.performance.estimatedCTR}%</div>
                  <div className="text-xs text-gray-500">CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-600">{template.performance.viralScore}</div>
                  <div className="text-xs text-gray-500">Viral Score</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => copyToClipboard(template.hook, 'Hook')}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Hook
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex items-center justify-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show message when filtered results are empty */}
      {!loading && templates.length > 0 && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No templates found for "{activeFilter}" category.</p>
          <button
            onClick={() => setSelectedNiche('all')}
            className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Show all templates
          </button>
        </div>
      )}
    </div>
  );
}