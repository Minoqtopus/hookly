"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/domains/auth";
import { useGeneration } from "@/domains/generation";
import { useGenerationSocket } from "@/hooks/useGenerationSocket";
import { StreamingContent } from "@/components/feature/generation";
import { Copy, Sparkles, Zap, ArrowRight, Link, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { TokenService } from "@/shared/services/token-service";

export default function GeneratePage() {
  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState<string>("tiktok");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // URL Analyzer state
  const [productUrl, setProductUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const { user, remainingGenerations, decrementGenerationCount, updateRemainingGenerations, getCurrentUser } = useAuth();
  const { createGeneration } = useGeneration();
  
  // WebSocket streaming
  const {
    isConnected,
    joinGeneration,
    currentStage,
    streamedContent,
  } = useGenerationSocket({
    onCompleted: async (generation) => {
      console.log('Generation completed:', generation);
      setIsGenerating(false);
      // Fetch fresh user data from backend to get updated counts
      try {
        const result = await getCurrentUser();
        console.log('✅ User data refreshed after generation completion:', {
          remainingGenerations: result?.remainingGenerations,
          userTrialGenerationsUsed: result?.user?.trial_generations_used
        });
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        // Fallback: decrement locally if refresh fails
        console.log('⚠️ Using fallback: decrementing locally');
        decrementGenerationCount();
      }
      // Don't set result here - let the streaming content display
    },
    onError: (error) => {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setGenerationError(error);
    },
    onContentChunk: (chunk) => {
      console.log('Content chunk received in page:', chunk);
    },
    onStageUpdate: (stage) => {
      console.log('Stage update in page:', stage);
    }
  });

  // Platform restrictions based on user plan
  const getAvailablePlatforms = () => {
    const userPlan = user?.plan || 'trial';
    
    switch (userPlan) {
      case 'pro':
        return ['tiktok', 'instagram', 'youtube'];
      case 'starter':
        return ['tiktok', 'instagram'];
      case 'trial':
      default:
        return ['tiktok'];
    }
  };

  const availablePlatforms = getAvailablePlatforms();
  const isPlatformDisabled = (platform: string) => !availablePlatforms.includes(platform);

  // Reset platform to first available if current platform is not available
  useEffect(() => {
    if (isPlatformDisabled(platform) && availablePlatforms.length > 0) {
      setPlatform(availablePlatforms[0]);
    }
  }, [platform, availablePlatforms, isPlatformDisabled]);

  const handleGenerate = async () => {
    if (!productName || !niche || !targetAudience || remainingGenerations <= 0) return;
    
    setResult(null);
    setGenerationError(null);
    setIsGenerating(true);
    
    // Generate a unique streaming ID and join the room BEFORE starting generation
    const streamingId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    // Join WebSocket room immediately (this also clears previous content)
    joinGeneration(streamingId);
    
    try {
      const response = await createGeneration({
        productName,
        niche,
        targetAudience,
        platform: platform as "tiktok" | "instagram" | "youtube",
        streamingId,
      });
      
      if (response.success && 'data' in response && response.data) {
        // Update user stats if provided by backend
        if ((response.data as any)?.user_stats?.generations_remaining !== undefined) {
          updateRemainingGenerations((response.data as any).user_stats.generations_remaining);
        }
        
        // Fallback in case WebSocket doesn't work
        setTimeout(() => {
          if (isGenerating) {
            setResult(`**Hook:** ${response.data?.hook}\n\n**Script:**\n${response.data?.script}`);
            setIsGenerating(false);
          }
        }, 30000);
      } else {
        setIsGenerating(false);
        setGenerationError('Failed to start generation');
      }
    } catch (error) {
      setIsGenerating(false);
      setGenerationError('Failed to start generation');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  // URL Analyzer function
  const analyzeProduct = async () => {
    if (!productUrl.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const tokenService = new TokenService();
      const accessToken = tokenService.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/generation/analyze-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ productUrl: productUrl.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze product URL');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Auto-fill form with analyzed data
        if (result.data.product_name) {
          setProductName(result.data.product_name);
        }
        if (result.data.niche) {
          setNiche(result.data.niche);
        }
        if (result.data.target_audience) {
          setTargetAudience(result.data.target_audience);
        }
        
        // Show success message (you could add a toast here)
        console.log('✅ Product analyzed successfully:', result.data);
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Product analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze product URL');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isFormValid = productName && 
    productName.length >= 10 && 
    niche && 
    niche.length >= 3 && 
    targetAudience && 
    targetAudience.length >= 20 && 
    remainingGenerations > 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Generate Viral Content</h1>
        <p className="text-lg text-muted-foreground">
          Create compelling scripts that captivate your audience
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Side: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="space-y-5">
              {/* NEW: URL Analyzer Section */}
              <div className="border-b border-border pb-5">
                <Label htmlFor="productUrl" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Paste your product URL (optional)
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Paste your website, landing page, or product URL to auto-fill the form below
                </p>
                <div className="flex gap-2">
                  <Input
                    id="productUrl"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://your-product-website.com"
                    className="flex-1"
                    disabled={isAnalyzing}
                  />
                  <Button 
                    onClick={analyzeProduct}
                    disabled={!productUrl.trim() || isAnalyzing}
                    variant="outline"
                    className="shrink-0"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
                {analysisError && (
                  <p className="text-sm text-red-500 mt-2">{analysisError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Or fill out the form manually below
                </p>
              </div>
              
              <div>
                <Label htmlFor="productName" className="text-sm font-medium text-foreground">
                  What are you promoting?
                </Label>
                <Textarea
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., FitTracker Pro Smartwatch, My New Course, etc."
                  rows={2}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="niche" className="text-sm font-medium text-foreground">
                  What's your niche?
                </Label>
                <Textarea
                  id="niche"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., Health & Fitness, Business & Productivity, etc."
                  rows={2}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="targetAudience" className="text-sm font-medium text-foreground">
                  Who's your target audience?
                </Label>
                <Textarea
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Fitness enthusiasts aged 25-40 who want to track their workouts"
                  rows={3}
                  className="mt-1"
                />
                {targetAudience && targetAudience.length < 20 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Please provide at least 20 characters for better results
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="platform" className="text-sm font-medium text-foreground">
                  Platform
                </Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram" disabled={isPlatformDisabled('instagram')}>
                      Instagram {isPlatformDisabled('instagram') && '(Starter+)'}
                    </SelectItem>
                    <SelectItem value="youtube" disabled={isPlatformDisabled('youtube')}>
                      YouTube {isPlatformDisabled('youtube') && '(Pro)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={!isFormValid || isGenerating}
              className="w-full mt-6 h-12"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Zap className="w-5 h-5 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : remainingGenerations <= 0 ? (
                "No Generations Left"
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Content ({remainingGenerations} left)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {!isConnected && (
              <p className="text-sm text-amber-600 mt-2 text-center">
                ⚡ Connecting for real-time streaming...
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Generated Content */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-xl border border-border p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Your Generated Content</h2>
              {(result || (streamedContent.title || streamedContent.hook || streamedContent.script)) && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              )}
            </div>
            
            <div className="min-h-[400px]">
              {isGenerating || currentStage || streamedContent.title || streamedContent.hook || streamedContent.script ? (
                <StreamingContent
                  title={streamedContent.title}
                  hook={streamedContent.hook}
                  script={streamedContent.script}
                  stage={currentStage?.stage || null}
                  progress={currentStage?.progress || 0}
                  message={currentStage?.message || ''}
                  error={generationError || undefined}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/60" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Ready to create viral content?</h3>
                    <p className="text-muted-foreground">Fill out the form on the left and click "Generate Content" to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}