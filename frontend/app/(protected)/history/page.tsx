'use client';

import { AuthModal } from '@/app/components/modals';
import { useAuth } from '@/app/lib/context';
import { toast } from '@/app/lib/utils';

// Simple Generation type
type Generation = {
  id: string;
  hook: string;
  script: string;
  title?: string;
  niche?: string;
  target_audience?: string;
  created_at: string;
  is_favorite?: boolean;
  performance_data?: {
    views?: number;
    ctr?: number;
    conversions?: number;
  };
};
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Copy,
    Filter,
    Heart,
    Search,
    Share2,
    Sparkles,
    Target
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface PaginationInfo {
  limit: number;
  offset: number;
  hasMore: boolean;
  totalPages: number;
}

interface GenerationsResponse {
  generations: Generation[];
  total: number;
  pagination: PaginationInfo;
}

interface FilterState {
  niche: string;
  dateRange: '7d' | '30d' | '90d' | 'all';
  favorites: boolean;
  search: string;
}

export default function HistoryPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 12,
    offset: 0,
    hasMore: false,
    totalPages: 1,
  });
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    niche: '',
    dateRange: 'all',
    favorites: false,
    search: '',
  });
  const [availableNiches, setAvailableNiches] = useState<string[]>([]);

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const loadGenerations = useCallback(async (page: number = 1, reset: boolean = false) => {
    // Mock empty data since API is removed
    setGenerations([]);
    setTotal(0);
    setPagination({
      limit: pagination.limit,
      offset: 0,
      hasMore: false,
      totalPages: 1,
    });
    setCurrentPage(1);
    setAvailableNiches([]);
  }, [pagination.limit]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadGenerations(1, true);
    }
  }, [isAuthenticated, authLoading, loadGenerations, total, user?.plan]);

  const handleCopyGeneration = (generation: Generation) => {
    const textToCopy = `${generation.hook}\n\n${generation.script}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('Ad content copied to clipboard!');
    
  };

  const handleShareGeneration = (generation: Generation) => {
    const shareText = `Check out this viral ad hook: "${generation.hook}"`;
    const shareUrl = `${window.location.origin}/shared/${generation.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: generation.title,
        text: shareText,
        url: shareUrl,
      }).then(() => {
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast.success('Share link copied to clipboard!');
      
    }
  };

  const handleToggleFavorite = async (generationId: string) => {
    try {
      const generation = generations.find(g => g.id === generationId);
      const newFavoriteStatus = !generation?.is_favorite;
      
      // For now, just update the local state
      // In production, you'd call an API endpoint to toggle favorite
      setGenerations(prev => 
        prev.map(gen => 
          gen.id === generationId 
            ? { ...gen, is_favorite: newFavoriteStatus }
            : gen
        )
      );
      toast.success('Favorite status updated!');
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    loadGenerations(page, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // In a full implementation, you'd apply filters on the backend
    // For now, we'll just update the local state
  };

  const clearFilters = () => {
    setFilters({
      niche: '',
      dateRange: 'all',
      favorites: false,
      search: '',
    });
  };

  const filteredGenerations = generations.filter(generation => {
    if (filters.niche && generation.niche !== filters.niche) return false;
    if (filters.favorites && !generation.is_favorite) return false;
    if (filters.search && !generation.hook.toLowerCase().includes(filters.search.toLowerCase()) && 
        !generation.script.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.dateRange !== 'all') {
      const createdAt = new Date(generation.created_at);
      const now = new Date();
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
      }[filters.dateRange] || 0;
      
      if (now.getTime() - createdAt.getTime() > daysAgo * 24 * 60 * 60 * 1000) {
        return false;
      }
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <span className="font-bold text-gray-900">Generation History</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>

              {/* Plan Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.plan === 'starter' || user.plan === 'agency'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {user.plan === 'trial' ? 'TRIAL' : user.plan === 'starter' ? 'STARTER' : user.plan === 'pro' ? 'PRO' : 'AGENCY'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your generations..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Niche Filter */}
              <select
                value={filters.niche}
                onChange={(e) => handleFilterChange({ niche: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Niches</option>
                {availableNiches.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>

              {/* Date Range Filter */}
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as FilterState['dateRange'] })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>

              {/* Favorites Filter */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.favorites}
                  onChange={(e) => handleFilterChange({ favorites: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Favorites only</span>
              </label>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Generation History</h1>
          <p className="text-gray-600">
            {total > 0 
              ? `You've created ${total} viral ad${total === 1 ? '' : 's'} so far! ${filteredGenerations.length < total ? `Showing ${filteredGenerations.length} matching your filters.` : ''}`
              : "You haven't created any ads yet. Start generating viral content!"
            }
          </p>
        </div>

        {/* Loading State */}
        {isLoading && generations.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your generations...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredGenerations.length === 0 && total === 0 && (
          <div className="text-center py-16">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No generations yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start creating viral ad content to see your generation history here.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Create Your First Ad
            </Link>
          </div>
        )}

        {/* No Filter Results */}
        {!isLoading && filteredGenerations.length === 0 && total > 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching results</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your filters to see more generations.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Generations Grid */}
        {filteredGenerations.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredGenerations.map((generation) => (
                <div
                  key={generation.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {generation.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Target className="h-4 w-4" />
                        <span>{generation.niche}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(generation.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        generation.is_favorite
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${generation.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Hook Preview */}
                  <div className="mb-4">
                    <p className="text-gray-900 font-medium line-clamp-2 mb-2">
                      {generation.hook}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {generation.script}
                    </p>
                  </div>

                  {/* Performance Data */}
                  {generation.performance_data && (
                    <div className="flex items-center space-x-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {generation.performance_data.views?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {generation.performance_data.ctr ? `${(generation.performance_data.ctr * 100).toFixed(1)}%` : '0%'}
                        </div>
                        <div className="text-xs text-gray-500">CTR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {generation.performance_data?.conversions || '0'}
                        </div>
                        <div className="text-xs text-gray-500">Conv.</div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(generation.created_at)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyGeneration(generation)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy content"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleShareGeneration(generation)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, total)} of {total} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource="login"
      />
    </div>
  );
}
