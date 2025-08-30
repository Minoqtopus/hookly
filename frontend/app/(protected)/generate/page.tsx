"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/domains/auth";
import { useGeneration } from "@/domains/generation";
import { useGenerationSocket } from "@/hooks/useGenerationSocket";
import { StreamingContent } from "@/components/generation/StreamingContent";
import { Copy, Sparkles, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function GeneratePage() {
  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState<string>("tiktok");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const { user, remainingGenerations } = useAuth();
  const { recentGenerations, isLoading, createGeneration } = useGeneration();
  
  // WebSocket streaming
  const {
    isConnected,
    joinGeneration,
    currentStage,
    streamedContent,
    disconnect
  } = useGenerationSocket({
    onCompleted: (generation) => {
      setIsGenerating(false);
      setResult(`**Hook:** ${generation.hook}\n\n**Script:**\n${generation.script}`);
    },
    onError: (error) => {
      setIsGenerating(false);
      setGenerationError(error);
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
    console.log('🚀 Starting generation with streaming ID:', streamingId);
    
    // Join WebSocket room immediately
    joinGeneration(streamingId, user?.id || '');
    
    try {
      const response = await createGeneration({
        productName,
        niche,
        targetAudience,
        platform: platform as "tiktok" | "instagram" | "youtube",
        streamingId, // Pass the streaming ID to backend
      });
      
      if (response.success && 'data' in response && response.data) {
        console.log('✅ Generation request successful, streaming should start');
        
        // Fallback in case WebSocket doesn't work
        setTimeout(() => {
          if (isGenerating) {
            console.log('⏰ Fallback timeout reached, showing static results');
            setResult(`**Hook:** ${response.data?.hook}\n\n**Script:**\n${response.data?.script}`);
            setIsGenerating(false);
          }
        }, 30000); // 30 second fallback
      } else {
        setIsGenerating(false);
        setGenerationError('Failed to start generation');
      }
    } catch (error) {
      console.error('❌ Generation request failed:', error);
      setIsGenerating(false);
      setGenerationError('Failed to start generation');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Left Column: Generation Form */}
      <div className="md:col-span-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generate Content</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below to create your next viral script.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Textarea
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., FitTracker Pro Smartwatch"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Textarea
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., Health & Fitness Wearables"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Fitness enthusiasts aged 25-40 who track workouts regularly"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram" disabled={isPlatformDisabled('instagram')}>
                    <div className="flex items-center justify-between w-full">
                      <span>Instagram</span>
                      {isPlatformDisabled('instagram') && (
                        <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 ml-4">
                          STARTER+
                        </span>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="youtube" disabled={isPlatformDisabled('youtube')}>
                    <div className="flex items-center justify-between w-full">
                      <span>YouTube</span>
                      {isPlatformDisabled('youtube') && (
                        <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 ml-4">
                          PRO
                        </span>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter" disabled>
                    <div className="flex items-center justify-between w-full">
                      <span>X (Twitter)</span>
                      <span className="text-xs bg-muted-foreground text-muted rounded-full px-2 py-0.5 ml-4">
                        COMING SOON
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || isGenerating || !productName || !niche || !targetAudience || remainingGenerations <= 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  {currentStage?.message || "Generating with AI..."}
                </>
              ) : isLoading ? (
                "Loading..."
              ) : remainingGenerations <= 0 ? (
                "No Generations Left"
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Script ({remainingGenerations} left)
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Template Library</span>
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                PRO
              </span>
            </CardTitle>
            <CardDescription>
              Get started with proven, high-performing templates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 opacity-50">
            <div className="p-3 bg-secondary rounded-md text-sm font-medium">
              3-Step Educational Video
            </div>
             <div className="p-3 bg-secondary rounded-md text-sm font-medium">
              Product Demo Hook
            </div>
             <div className="p-3 bg-secondary rounded-md text-sm font-medium">
              Viral Storytelling Formula
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Results & History */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Script
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {isGenerating ? (
                "Watch your content being generated in real-time"
              ) : (
                "Your AI-generated script will appear here."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {isGenerating || currentStage ? (
              <StreamingContent
                title={streamedContent.title}
                hook={streamedContent.hook}
                script={streamedContent.script}
                stage={currentStage?.stage || null}
                progress={currentStage?.progress || 0}
                message={currentStage?.message || ''}
                error={generationError || undefined}
              />
            ) : result ? (
              <div className="p-4 bg-secondary rounded-lg whitespace-pre-wrap font-mono text-sm">
                {result}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Generate Script" to start creating your viral content</p>
                  {!isConnected && (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚡ Real-time streaming connecting...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGenerations.length > 0 ? (
                recentGenerations.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {item.platform}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No recent generations yet. Create your first one above!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}