'use client';

import AuthModal from '@/app/components/AuthModal';
import { getProcessedDemoContent } from '@/app/lib/copy/pages/demo';
import {
  ArrowRight,
  CheckCircle,
  Copy,
  Lightbulb,
  Play,
  RefreshCw,
  Sparkles,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface DemoAd {
  hook: string;
  script: string;
  visuals: string[];
  performance: {
    estimatedViews: number;
    estimatedCTR: number;
    viralScore: number;
  };
}

export default function DemoPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<DemoAd | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    niche: '',
    targetAudience: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get processed copy with dynamic values
  const copy = getProcessedDemoContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate demo ad');
      }

      const result = await response.json();
      setGeneratedAd(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTryAgain = () => {
    setGeneratedAd(null);
    setFormData({ productName: '', niche: '', targetAudience: '' });
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!generatedAd ? (
          // Demo Form
          <div className="space-y-10">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-800 px-6 py-3 rounded-full mb-6">
                <Play className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {copy.form.badge}
                </span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                {copy.form.title.prefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">{copy.form.title.highlight}</span> {copy.form.title.suffix}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {copy.form.subtitle}
              </p>
            </div>

            {/* Demo Limitations Notice */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex">
                <Lightbulb className="h-6 w-6 text-amber-600 mt-0.5 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">{copy.form.limitations.title}</h3>
                  <p className="text-amber-800">
                    {copy.form.limitations.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">{copy.form.quickStart.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {copy.form.quickStart.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setFormData(suggestion)}
                      className="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                    >
                      <div className="font-medium text-gray-900">{suggestion.productName}</div>
                      <div className="text-sm text-gray-600">{suggestion.niche} • {suggestion.targetAudience}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      {copy.form.fields.productName.label}
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder={copy.form.fields.productName.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {copy.form.fields.productName.helpText}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      {copy.form.fields.niche.label}
                    </label>
                    <input
                      type="text"
                      value={formData.niche}
                      onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                      placeholder={copy.form.fields.niche.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      {copy.form.fields.targetAudience.label}
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder={copy.form.fields.targetAudience.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {copy.form.fields.targetAudience.helpText}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isGenerating || !formData.productName || !formData.niche || !formData.targetAudience}
                    className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold text-lg py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        {copy.form.generateButton.loading}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6 mr-3" />
                        {copy.form.generateButton.default}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          // Demo Results
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {copy.results.header.title}
              </h1>
              <p className="text-gray-600">
                {copy.results.header.subtitle}
              </p>
            </div>

            {/* Performance Metrics */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                {copy.results.performance.title}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {((generatedAd.performance.estimatedViews) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-600">Est. Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {generatedAd.performance.estimatedCTR}%
                  </div>
                  <div className="text-xs text-gray-600">Est. CTR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedAd.performance.viralScore}/10
                  </div>
                  <div className="text-xs text-gray-600">Viral Score</div>
                </div>
              </div>
            </div>

            {/* Generated Content */}
            <div className="space-y-6">
              {/* Hook */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 text-primary-600 mr-2" />
                    {copy.results.sections.hook}
                  </h3>
                  <button
                    onClick={() => handleCopyToClipboard(generatedAd.hook, 'Hook')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 font-medium italic">
                    {generatedAd.hook}
                  </p>
                </div>
                {copiedField === 'Hook' && (
                  <p className="text-green-600 text-xs mt-2">{copy.results.copiedMessage}</p>
                )}
              </div>

              {/* Script */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {copy.results.sections.script}
                  </h3>
                  <button
                    onClick={() => handleCopyToClipboard(generatedAd.script, 'Script')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-line">
                    {generatedAd.script}
                  </p>
                </div>
                {copiedField === 'Script' && (
                  <p className="text-green-600 text-xs mt-2">{copy.results.copiedMessage}</p>
                )}
              </div>

              {/* Visual Suggestions */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {copy.results.sections.visuals}
                </h3>
                <div className="space-y-3">
                  {generatedAd.visuals.map((visual, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary-600">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{visual}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Demo to Trial Conversion */}
            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{copy.results.conversion.title}</h3>
                <p className="text-gray-600 mb-4">
                  {copy.results.conversion.subtitle}
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">{copy.results.conversion.benefits.title}</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {copy.results.conversion.benefits.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    {copy.results.conversion.buttons.primary}
                  </button>
                  <Link href="/pricing" className="btn-secondary text-lg px-8 py-3 flex items-center justify-center">
                    {copy.results.conversion.buttons.secondary}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {copy.results.conversion.disclaimer}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={handleTryAgain}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
{copy.results.tryAgainButton}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource="nav_signup"
      />
    </div>
  );
}