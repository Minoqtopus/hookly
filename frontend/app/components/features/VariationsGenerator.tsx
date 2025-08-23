'use client';

import { useAuth } from '@/app/lib/context';
import { toast } from '@/app/lib/utils';
import { ArrowRight, CheckCircle, Copy, Crown, Download, Heart, RefreshCw, Target, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

interface Variation {
  id: string;
  output: {
    hook: string;
    script: string;
    visuals: string[];
    performance: {
      expected_ctr: number;
      expected_cpc: number;
      expected_roas: number;
    };
  };
  metrics: {
    virality_score: number;
    engagement_score: number;
    conversion_score: number;
  };
}

interface Props {
  baseContent: {
    hook: string;
    script: string;
    productName: string;
    niche: string;
    targetAudience: string;
  };
  onUpgrade?: () => void;
}

export default function VariationsGenerator({ baseContent, onUpgrade }: Props) {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  const handleGenerateVariations = async () => {
    if (!isAuthenticated) {
      onUpgrade?.();
      return;
    }

    setIsGenerating(true);
    try {
      // Mock generation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Variations generated successfully!');
    } catch (error) {
      toast.error('Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVariation = (variation: Variation) => {
    const content = `${variation.output.hook}\n\n${variation.output.script}`;
    navigator.clipboard.writeText(content);
    toast.success('Variation copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Variations</h3>
        <button
          onClick={handleGenerateVariations}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Target className="h-4 w-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Variations'}
        </button>
      </div>

      {variations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Variations Yet</h4>
          <p className="text-gray-600">
            Generate AI-powered variations of your ad content to test different approaches
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {variations.map((variation) => (
            <div key={variation.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {variation.metrics.virality_score}/10
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyVariation(variation)}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Hook:</h5>
                  <p className="text-sm text-gray-600">{variation.output.hook}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Script:</h5>
                  <p className="text-sm text-gray-600 line-clamp-3">{variation.output.script}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>CTR: {variation.output.performance.expected_ctr}%</span>
                  <span>CPC: ${variation.output.performance.expected_cpc}</span>
                  <span>ROAS: {variation.output.performance.expected_roas}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}