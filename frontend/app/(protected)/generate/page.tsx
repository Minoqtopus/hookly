"use client";

import {
  StreamingContent,
  UGCScriptFormatter,
} from "@/components/feature/generation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  ArrowRight,
  CheckCircle,
  Copy,
  Link,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function GeneratePage() {
  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState<string>("tiktok");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // URL Analyzer state
  const [productUrl, setProductUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const {
    user,
    remainingGenerations,
    decrementGenerationCount,
    updateRemainingGenerations,
    getCurrentUser,
  } = useAuth();

  // Debug: Log when remainingGenerations changes in generate page
  useEffect(() => {
    console.log(
      "📊 Generate Page: remainingGenerations updated to:",
      remainingGenerations
    );
  }, [remainingGenerations]);
  const { createGeneration } = useGeneration();

  // WebSocket streaming
  const { isConnected, joinGeneration, currentStage, streamedContent } =
    useGenerationSocket({
      onCompleted: async (generation) => {
        console.log("Generation completed:", generation);
        setIsGenerating(false);

        // FIXED: Single source of truth - only refresh user data, no local decrements
        try {
          const result = await getCurrentUser();
          console.log("✅ User data refreshed after generation completion:", {
            remainingGenerations: result?.remainingGenerations,
            userTrialGenerationsUsed: result?.user?.trial_generations_used,
          });
        } catch (error) {
          console.error(
            "❌ Failed to refresh user data after generation completion:",
            error
          );
          // Don't use fallback decrement - this causes inconsistency
          // The backend has already updated counts, so refresh will work on retry
        }

        // Don't set result here - let the streaming content display
      },
      onError: (error) => {
        console.error("Generation error:", error);
        setIsGenerating(false);
        setGenerationError(error);
      },
      onContentChunk: (chunk) => {
        console.log("Content chunk received in page:", chunk);
      },
      onStageUpdate: (stage) => {
        console.log("Stage update in page:", stage);
      },
    });

  // Platform restrictions based on user plan - MATCHES PRICING CONFIG
  const getAvailablePlatforms = () => {
    const userPlan = user?.plan || "trial";

    // All plans get TikTok & Instagram access (no YouTube)
    switch (userPlan) {
      case "pro":
      case "starter":
      case "trial":
      default:
        return ["tiktok", "instagram"];
    }
  };

  const availablePlatforms = getAvailablePlatforms();
  const isPlatformDisabled = (platform: string) =>
    !availablePlatforms.includes(platform);

  // Reset platform to first available if current platform is not available
  useEffect(() => {
    if (isPlatformDisabled(platform) && availablePlatforms.length > 0) {
      setPlatform(availablePlatforms[0]);
    }
  }, [platform, availablePlatforms, isPlatformDisabled]);

  const handleGenerate = async () => {
    if (!productName || !niche || !targetAudience || remainingGenerations <= 0)
      return;

    setResult(null);
    setGenerationError(null);
    setIsGenerating(true);

    // Generate a unique streaming ID and join the room BEFORE starting generation
    const streamingId = `gen_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

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

      if (response.success && "data" in response && response.data) {
        // FIXED: Use backend response as single source of truth for generation counts
        if (
          (response.data as any)?.user_stats?.generations_remaining !==
          undefined
        ) {
          updateRemainingGenerations(
            (response.data as any).user_stats.generations_remaining
          );
          // REMOVED: decrementGenerationCount() - backend already decremented and returned correct count
          console.log(
            "✅ Updated generation count from backend response:",
            (response.data as any).user_stats.generations_remaining
          );
        }

        // Remove redundant getCurrentUser() call to prevent race conditions
        // The backend already provides the updated count in user_stats

        // Fallback in case WebSocket doesn't work
        setTimeout(() => {
          if (isGenerating) {
            setResult(
              `**Hook:** ${response.data?.hook}\n\n**Script:**\n${response.data?.script}`
            );
            setIsGenerating(false);
          }
        }, 30000);
      } else {
        setIsGenerating(false);
        // Use the specific error message from the response
        setGenerationError(
          ("message" in response ? response.message : response.error) ||
            "Failed to start generation"
        );
      }
    } catch (error: any) {
      setIsGenerating(false);
      // Extract error message from caught exception
      const errorMessage = error?.message || "Failed to start generation";
      setGenerationError(errorMessage);
      console.error("Generation error:", error);

      // FIXED: Only refresh on error if generation might have been partially processed
      // Most errors happen before backend processing, so no refresh needed
      console.log(
        "❌ Generation failed before processing - no count refresh needed"
      );
    }
  };

  const handleCopy = () => {
    // Create clean content from both streaming and result data
    const getCleanText = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\\n\\n/g, "\n\n")
        .replace(/\\n/g, "\n")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/\\\*/g, "*")
        .trim();
    };

    let contentToCopy = "";

    // Get content from streaming first, then fallback to result
    const titleContent =
      streamedContent.title ||
      (result && result.includes("**Title:**")
        ? result.split("**Title:**")[1]?.split("\n\n")[0]
        : "");

    const hookContent =
      streamedContent.hook ||
      (result && result.includes("**Hook:**")
        ? result.split("**Hook:**")[1]?.split("\n\n")[0]
        : "");
    const scriptContent =
      streamedContent.script ||
      (result && result.includes("**Script:**")
        ? result.split("**Script:**")[1]
        : "");

    if (titleContent) {
      contentToCopy += `TITLE:\n${getCleanText(titleContent)}\n\n`;
    }

    if (hookContent) {
      contentToCopy += `HOOK:\n${getCleanText(hookContent)}\n\n`;
    }

    if (scriptContent) {
      contentToCopy += `SCRIPT:\n${getCleanText(scriptContent)}`;
    }

    // Fallback to raw result if no streaming content
    if (!contentToCopy && result) {
      contentToCopy = getCleanText(result);
    }

    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      console.log("Content copied to clipboard");
    }
  };

  // URL Analyzer function
  const analyzeProduct = async () => {
    if (!productUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const { AuthCoordinator } = await import('@/shared/services');
      const authCoordinator = new AuthCoordinator();
      const accessToken = authCoordinator.getAccessToken();

      if (!accessToken) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/generation/analyze-product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productUrl: productUrl.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze product URL");
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
        console.log("✅ Product analyzed successfully:", result.data);
      } else {
        throw new Error(result.message || "Analysis failed");
      }
    } catch (error) {
      console.error("❌ Product analysis failed:", error);
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to analyze product URL"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isFormValid =
    productName &&
    productName.length >= 10 &&
    niche &&
    niche.length >= 3 &&
    targetAudience &&
    targetAudience.length >= 20 &&
    remainingGenerations > 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Generate Viral UGC Scripts
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate TikTok & Instagram scripts that actually convert. Perfect for
          creators building their brand.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Side: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="space-y-5">
              {/* NEW: URL Analyzer Section */}
              <div className="border-b border-border pb-5">
                <Label
                  htmlFor="productUrl"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  Paste your product URL (optional)
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Paste your website, landing page, or product URL to auto-fill
                  the form below
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
                <Label
                  htmlFor="productName"
                  className="text-sm font-medium text-foreground"
                >
                  What are you promoting? (Product or Personal Brand)
                </Label>
                <Textarea
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., FitTracker Pro Smartwatch, My Personal Fitness Journey, My New Course, etc."
                  rows={2}
                  className="mt-1"
                />
                {productName && productName.length < 10 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Please provide at least 10 characters for better UGC scripts
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="niche"
                  className="text-sm font-medium text-foreground"
                >
                  What niche are you in?
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
                <Label
                  htmlFor="targetAudience"
                  className="text-sm font-medium text-foreground"
                >
                  Who's your target audience?
                </Label>
                <Textarea
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Fitness enthusiasts aged 25-40 who want to track their workouts and improve their health"
                  rows={3}
                  className="mt-1"
                />
                {targetAudience && targetAudience.length < 20 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Please provide at least 20 characters for better UGC scripts
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="platform"
                  className="text-sm font-medium text-foreground"
                >
                  Platform
                </Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
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
                "No UGC Scripts Left"
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate UGC Script ({remainingGenerations} left)
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
              <h2 className="text-xl font-semibold text-foreground">
                Your Generated UGC Script
              </h2>
              {(result ||
                streamedContent.title ||
                streamedContent.hook ||
                streamedContent.script) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isCopied}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="min-h-[400px]">
              {isGenerating || currentStage ? (
                <StreamingContent
                  title={streamedContent.title}
                  hook={streamedContent.hook}
                  script={streamedContent.script}
                  stage={currentStage?.stage || null}
                  progress={currentStage?.progress || 0}
                  message={currentStage?.message || ""}
                  error={generationError || undefined}
                />
              ) : (
                <UGCScriptFormatter
                  content={{
                    title:
                      streamedContent.title ||
                      (result && result.includes("**Title:**")
                        ? result
                            .split("**Title:**")[1]
                            ?.split("\n\n")[0]
                            ?.replace(/\*\*/g, "")
                        : undefined),
                    hook:
                      streamedContent.hook ||
                      (result && result.includes("**Hook:**")
                        ? result
                            .split("**Hook:**")[1]
                            ?.split("\n\n")[0]
                            ?.replace(/\*\*/g, "")
                        : undefined),
                    script:
                      streamedContent.script ||
                      (result && result.includes("**Script:**")
                        ? result.split("**Script:**")[1]?.replace(/\*\*/g, "")
                        : undefined),
                  }}
                  platform={platform as "tiktok" | "instagram"}
                  onCopy={(section) => {
                    console.log(`✅ Section copied: ${section}`);
                    if (section !== "all") {
                      setCopiedSection(section);
                      setTimeout(() => setCopiedSection(null), 2000);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
