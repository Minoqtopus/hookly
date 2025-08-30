"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generationRepository } from "@/domains/generation/repositories/generation-repository";
import { Generation, GenerationType } from "@/domains/generation/contracts/generation";
import { AlertCircle, Copy, Film, Sparkles, TrendingUp, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MetricCard } from "./MetricCard";
import { motion, AnimatePresence } from "framer-motion";

const templates = [
  { product: "Fitness App", niche: "Health & Wellness", audience: "Busy professionals 25-40" },
  { product: "Coffee Subscription", niche: "Food & Beverage", audience: "Coffee enthusiasts" },
  { product: "Language Learning", niche: "Education", audience: "Young adults 18-35" },
  { product: "Project Management Tool", niche: "Productivity", audience: "Remote teams" },
];

// Typewriter component for simulating the streaming effect
const TypewriterText: React.FC<{ 
  text: string; 
  speed?: number;
  onComplete?: () => void;
  startDelay?: number;
}> = ({ text, speed = 20, onComplete, startDelay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete && currentIndex === text.length && text.length > 0) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, started]);

  return <span>{displayedText}</span>;
};

export const Demo = () => {
  const [productName, setProductName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Streaming states
  const [titleComplete, setTitleComplete] = useState(false);
  const [hookComplete, setHookComplete] = useState(false);
  const [scriptComplete, setScriptComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!productName || !niche || !targetAudience) {
      toast.error("Please fill in all fields");
      return;
    }

    // Reset all states
    setIsLoading(true);
    setError(null);
    setGeneration(null);
    setProgress(0);
    setCurrentStage('analyzing');
    setTitleComplete(false);
    setHookComplete(false);
    setScriptComplete(false);
    setShowResults(false);

    try {
      // Simulate progress stages
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 3;
        setProgress(Math.min(currentProgress, 95));
      }, 100);

      // Stage 1: Analyzing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStage('generating');
      
      // Stage 2: Generating
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStage('optimizing');

      // Stage 3: Get actual data for selected platform
      const response = await generationRepository.createDemoGenerations({
        productName,
        niche,
        targetAudience,
        platform,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.data) {
        // Use the generated content for selected platform
        const selectedPlatformGen = response.data[0]; // Should be only one for the selected platform
        setGeneration(selectedPlatformGen);
        setCurrentStage('completed');
        setShowResults(true);
        
        // Small delay before starting typewriter
        setTimeout(() => {
          toast.success("Script generated successfully!");
        }, 500);
      } else {
        setError(response.error || "Failed to generate content");
        toast.error(response.error || "Failed to generate content");
        setCurrentStage(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setCurrentStage(null);
    } finally {
      setIsLoading(false);
      // Keep stage as 'completed' for 2 seconds before hiding
      if (currentStage === 'completed') {
        setTimeout(() => {
          setCurrentStage(null);
        }, 2000);
      }
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

  const getStageIcon = () => {
    switch (currentStage) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStageMessage = () => {
    const platformName = platform === 'tiktok' ? 'TikTok' : 'Instagram';
    switch (currentStage) {
      case 'analyzing':
        return 'Analyzing your product details...';
      case 'generating':
        return `Crafting viral ${platformName} script...`;
      case 'optimizing':
        return 'Optimizing for maximum engagement...';
      case 'completed':
        return `Your viral ${platformName} script is ready!`;
      default:
        return '';
    }
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
            Watch AI create personalized UGC scripts for TikTok & Instagram in real-time. Perfect for creators building their brand.
          </p>
        </div>

        {/* Demo Sandbox */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-secondary/30 border border-border rounded-2xl p-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product/Service Name</Label>
                  <Input
                    id="product"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., EcoClean Cleaner"
                    className="w-full"
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as 'tiktok' | 'instagram')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                  </select>
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
                      disabled={isLoading}
                      className="px-4 py-2 bg-secondary/50 text-sm rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate {platform === 'tiktok' ? 'TikTok' : 'Instagram'} Script
                  </>
                )}
              </Button>
            </div>

            {/* Progress Section */}
            <AnimatePresence>
              {isLoading && currentStage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 space-y-4"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {getStageIcon()}
                    <span className="text-sm font-medium">{getStageMessage()}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Results Section with Typewriter Effect */}
            <AnimatePresence>
              {showResults && generation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 space-y-6"
                >
                  {/* Platform Header */}
                  <div className="flex items-center justify-center space-x-2 py-3 bg-black/5 dark:bg-white/5 rounded-lg">
                    <Film className="w-5 h-5" />
                    <span className="font-semibold">TikTok Script</span>
                    {!scriptComplete && (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    )}
                  </div>

                  {/* Title with Typewriter */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-base">{platform === 'tiktok' ? 'TikTok' : 'Instagram'} Title</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopy(generation.title, "Title")}
                        disabled={!titleComplete}
                        className="opacity-0 animate-fadeIn"
                        style={{ animationDelay: titleComplete ? '0s' : '999s' }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <p className="font-medium text-lg">
                        <TypewriterText 
                          text={typeof generation.title === 'string' ? generation.title : 'Generated Title'}
                          speed={40}
                          onComplete={() => setTitleComplete(true)}
                          startDelay={500}
                        />
                        {titleComplete && !hookComplete && (
                          <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-1" />
                        )}
                      </p>
                    </div>
                  </motion.div>

                  {/* Hook with Typewriter */}
                  {titleComplete && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex justify-between items-center">
                        <Label className="text-base">{platform === 'tiktok' ? 'TikTok' : 'Instagram'} Hook</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopy(generation.hook, "Hook")}
                          disabled={!hookComplete}
                          className="opacity-0 animate-fadeIn"
                          style={{ animationDelay: hookComplete ? '0s' : '999s' }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                        <p className="text-base leading-relaxed italic">
                          <TypewriterText 
                            text={typeof generation.hook === 'string' ? generation.hook : 'Generated Hook'}
                            speed={25}
                            onComplete={() => setHookComplete(true)}
                            startDelay={200}
                          />
                          {hookComplete && !scriptComplete && (
                            <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-1" />
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Script with Typewriter */}
                  {hookComplete && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex justify-between items-center">
                        <Label className="text-base">Full {platform === 'tiktok' ? 'TikTok' : 'Instagram'} Script</Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopy(generation.script, "Script")}
                          disabled={!scriptComplete}
                          className="opacity-0 animate-fadeIn"
                          style={{ animationDelay: scriptComplete ? '0s' : '999s' }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg border border-border/50 min-h-[200px]">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed font-mono">
                          <TypewriterText 
                            text={typeof generation.script === 'string' ? generation.script : JSON.stringify(generation.script, null, 2)}
                            speed={8}
                            onComplete={() => setScriptComplete(true)}
                            startDelay={200}
                          />
                          {!scriptComplete && (
                            <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Performance Metrics - Show after script is complete */}
                  {scriptComplete && generation.performance_data && (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-center">
                        <Label className="text-base">Estimated Performance</Label>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <MetricCard
                          icon={TrendingUp}
                          label="Views"
                          value={generation.performance_data.views.toLocaleString()}
                          note="Potential"
                        />
                        <MetricCard
                          icon={Sparkles}
                          label="Clicks"
                          value={generation.performance_data.clicks.toLocaleString()}
                          note="Estimated"
                        />
                        <MetricCard
                          icon={Film}
                          label="Sales"
                          value={generation.performance_data.conversions.toString()}
                          note="Projected"
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
                    </motion.div>
                  )}

                  {/* CTA Section - Show after everything is complete */}
                  {scriptComplete && (
                    <motion.div 
                      className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h4 className="font-semibold text-lg mb-2">Ready to Create More?</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sign up now and get 5 free scripts to start creating viral content
                      </p>
                      <Button asChild>
                        <a href="/register">Start Free Trial</a>
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};