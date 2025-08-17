'use client';

import { useState } from 'react';
import { Copy, Heart, Download, RefreshCw, Crown, Target, TrendingUp, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/app/lib/AppContext';

interface Variation {
  id: string;
  output: {
    hook: string;
    script: string;
    visuals: string[];
    performance: {
      estimatedViews: number;
      estimatedCTR: number;
      viralScore: number;
    };
    variationNumber: number;
    variationApproach: string;
  };
  created_at: string;
}

interface VariationsGeneratorProps {
  formData: {
    productName: string;
    niche: string;
    targetAudience: string;
  };
  onUpgrade: () => void;
  onSave: (variation: Variation) => void;
  onExport: (variation: Variation) => void;
}

export default function VariationsGenerator({ formData, onUpgrade, onSave, onExport }: VariationsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!user?.has_batch_generation) {
      onUpgrade();
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate variations');
      }

      const data = await response.json();
      setVariations(data.variations);
    } catch (error) {
      console.error('Variations generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copied to clipboard!`);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  };

  const getApproachIcon = (approach: string) => {
    switch (approach) {
      case 'Problem/Solution':
        return Target;
      case 'Transformation/Results':
        return TrendingUp;
      case 'Social Proof/Trending':
        return Users;
      default:
        return Target;
    }
  };

  const getApproachColor = (approach: string) => {
    switch (approach) {
      case 'Problem/Solution':
        return 'text-blue-600 bg-blue-100';
      case 'Transformation/Results':
        return 'text-green-600 bg-green-100';
      case 'Social Proof/Trending':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user?.has_batch_generation) {
    return (
      <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
        <div className="text-center py-8">
          <Crown className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-3">🚀 Unlock Batch Variations</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate 3 different ad variations with unique approaches in one click. Perfect for A/B testing and finding your best performing angle.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Problem/Solution</h4>
              <p className="text-xs text-gray-600">Start with pain point</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Transformation</h4>
              <p className="text-xs text-gray-600">Show before/after</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Social Proof</h4>
              <p className="text-xs text-gray-600">Everyone's using it</p>
            </div>
          </div>

          <button
            onClick={onUpgrade}
            className="btn-primary text-lg px-8 py-4"
          >
            Upgrade to Pro - $1.30/day
          </button>
          <p className="text-xs text-gray-500 mt-2">
            3x more content • Better testing • Higher conversions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Generate 3 Variations
            </h3>
            <p className="text-sm text-gray-600">
              Get multiple approaches for A/B testing: Problem/Solution, Transformation, and Social Proof
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.productName || !formData.niche || !formData.targetAudience}
            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate 3 Variations
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Variations Results */}
      {variations.length > 0 && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-900">3 Variations Generated Successfully!</h4>
                <p className="text-sm text-green-700">Each variation uses a different psychological approach for maximum testing potential.</p>
              </div>
            </div>
          </div>

          {/* Variation Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {variations.map((variation, index) => {
              const IconComponent = getApproachIcon(variation.output.variationApproach);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedVariation(index)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    selectedVariation === index
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  Variation {index + 1}
                </button>
              );
            })}
          </div>

          {/* Selected Variation Display */}
          {variations[selectedVariation] && (
            <div className="space-y-6">
              {/* Approach Info */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getApproachColor(variations[selectedVariation].output.variationApproach)}`}>
                      {(() => {
                        const IconComponent = getApproachIcon(variations[selectedVariation].output.variationApproach);
                        return <IconComponent className="h-5 w-5" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {variations[selectedVariation].output.variationApproach} Approach
                      </h3>
                      <p className="text-sm text-gray-600">
                        Variation {variations[selectedVariation].output.variationNumber} of 3
                      </p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {(variations[selectedVariation].output.performance.estimatedViews / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">
                        {variations[selectedVariation].output.performance.estimatedCTR}%
                      </div>
                      <div className="text-xs text-gray-500">CTR</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">
                        {variations[selectedVariation].output.performance.viralScore}/10
                      </div>
                      <div className="text-xs text-gray-500">Viral</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hook */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">🎯 Hook</h4>
                  <button
                    onClick={() => handleCopyToClipboard(variations[selectedVariation].output.hook, 'Hook')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 italic">"{variations[selectedVariation].output.hook}"</p>
                </div>
              </div>

              {/* Script */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">📜 Full Script</h4>
                  <button
                    onClick={() => handleCopyToClipboard(variations[selectedVariation].output.script, 'Script')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {variations[selectedVariation].output.script}
                  </p>
                </div>
              </div>

              {/* Visual Prompts */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">🎬 Visual Prompts</h4>
                  <button
                    onClick={() => handleCopyToClipboard(variations[selectedVariation].output.visuals.join('\n'), 'Visual prompts')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {variations[selectedVariation].output.visuals.map((visual: string, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium text-primary-600">Shot {index + 1}:</span> {visual}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => onSave(variations[selectedVariation])}
                  className="btn-secondary flex items-center justify-center"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={() => onExport(variations[selectedVariation])}
                  className="btn-secondary flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={handleGenerate}
                  className="btn-secondary flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </button>
                <button className="btn-primary flex items-center justify-center">
                  A/B Test
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}