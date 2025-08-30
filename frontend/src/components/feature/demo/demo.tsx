"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generationRepository } from "@/domains/generation/repositories/generation-repository";
import { Generation, GenerationType } from "@/domains/generation/contracts/generation";
import { AlertCircle, Copy, Film, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "./MetricCard";

const templates = [
  { product: "Fitness App", niche: "Health & Wellness", audience: "Busy professionals 25-40" },
  { product: "Coffee Subscription", niche: "Food & Beverage", audience: "Coffee enthusiasts" },
  { product: "Language Learning", niche: "Education", audience: "Young adults 18-35" },
  { product: "Project Management Tool", niche: "Productivity", audience: "Remote teams" },
];

const PlatformIcon = ({ platform }: { platform: GenerationType }) => {
  switch (platform) {
    case GenerationType.INSTAGRAM:
      return (
        <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
        </svg>
      );
    case GenerationType.TIKTOK:
      return <Film className="w-4 h-4 text-black dark:text-white" />;
    case GenerationType.YOUTUBE:
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    default:
      return <Film className="w-4 h-4" />;
  }
};

const platformColors = {
  [GenerationType.INSTAGRAM]: "text-pink-500",
  [GenerationType.TIKTOK]: "text-black dark:text-white",
  [GenerationType.YOUTUBE]: "text-red-500",
};

export const Demo = () => {
  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<GenerationType>(GenerationType.TIKTOK);

  const handleGenerate = async () => {
    if (!productName || !niche || !targetAudience) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGenerations([]);

    try {
      const response = await generationRepository.createDemoGenerations({
        productName,
        niche,
        targetAudience,
      });

      if (response.success && response.data) {
        setGenerations(response.data);
        // Auto-select the first platform
        if (response.data.length > 0) {
          setSelectedPlatform(response.data[0].platform);
        }
        toast.success("Content generated successfully!");
      } else {
        setError(response.error || "Failed to generate content");
        toast.error(response.error || "Failed to generate content");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string | any, type: string) => {
    const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(textContent);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleTemplateClick = (template: typeof templates[0]) => {
    setProductName(template.product);
    setNiche(template.niche);
    setTargetAudience(template.audience);
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="container">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Experience the Magic
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Generate viral content for Instagram, TikTok, and YouTube. 
            See how AI creates personalized scripts for your product.
          </p>
        </div>

        {/* Demo Sandbox */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-secondary/30 border border-border rounded-2xl p-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product/Service Name</Label>
                  <Input
                    id="product"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., EcoClean Cleaner"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche">Market Niche</Label>
                  <Input
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g., Eco-friendly products"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Homeowners 25-45"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Or try one of our templates:
                </p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.product}
                      onClick={() => handleTemplateClick(template)}
                      className="px-4 py-2 bg-secondary/50 text-sm rounded-md hover:bg-secondary transition-colors"
                    >
                      {template.product}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="my-8 border-t border-border" />

            {/* Action */}
            <div className="text-center">
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !productName || !niche || !targetAudience}
                size="lg"
              >
                {isLoading ? (
                  "Generating for 3 platforms..."
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Viral Content
                  </>
                )}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">Generation Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {generations.length > 0 && (
              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-xl">Your Viral Content</h3>
                  <span className="text-sm text-muted-foreground">
                    Generated for 3 platforms
                  </span>
                </div>

                <Tabs value={selectedPlatform} onValueChange={(v: string) => setSelectedPlatform(v as GenerationType)}>
                  <TabsList className="grid w-full grid-cols-3">
                    {generations.map((gen) => {
                      return (
                        <TabsTrigger key={gen.platform} value={gen.platform} className="flex items-center gap-2">
                          <PlatformIcon platform={gen.platform} />
                          {gen.platform.charAt(0).toUpperCase() + gen.platform.slice(1)}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {generations.map((generation) => (
                    <TabsContent key={generation.platform} value={generation.platform} className="space-y-6 mt-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-base">Title</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopy(generation.title, "Title")}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <div className="p-3 bg-background/50 rounded-lg">
                          <p className="font-medium">{typeof generation.title === 'string' ? generation.title : 'Generated Title'}</p>
                        </div>
                      </div>

                      {/* Hook */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-base">Hook (Opening Line)</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopy(generation.hook, "Hook")}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <div className="p-4 bg-background/50 rounded-lg">
                          <p className="text-sm leading-relaxed">{typeof generation.hook === 'string' ? generation.hook : 'Generated Hook'}</p>
                        </div>
                      </div>

                      {/* Script */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-base">Full Script</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopy(generation.script, "Script")}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <div className="p-4 bg-background/50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed font-mono">
                            {typeof generation.script === 'string' ? generation.script : JSON.stringify(generation.script, null, 2)}
                          </p>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      {generation.performance_data && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                          <MetricCard
                            icon={TrendingUp}
                            label="Views"
                            value={generation.performance_data.views.toLocaleString()}
                            note="Estimated"
                          />
                          <MetricCard
                            icon={Sparkles}
                            label="Clicks"
                            value={generation.performance_data.clicks.toLocaleString()}
                            note="Projected"
                          />
                          <MetricCard
                            icon={Film}
                            label="Conversions"
                            value={generation.performance_data.conversions.toString()}
                            note="Potential"
                          />
                          <MetricCard
                            icon={TrendingUp}
                            label="CTR"
                            value={`${generation.performance_data.ctr}%`}
                            note="Click Rate"
                          />
                          <MetricCard
                            icon={Sparkles}
                            label="Engagement"
                            value={`${generation.performance_data.engagement_rate}%`}
                            note="Rate"
                          />
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>

                {/* CTA Section */}
                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
                  <h4 className="font-semibold text-lg mb-2">Ready to Create More?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign up now and get 15 free generations to start creating viral content
                  </p>
                  <Button asChild>
                    <a href="/register">Start Free Trial</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};