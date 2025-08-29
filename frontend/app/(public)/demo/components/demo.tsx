"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Film, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "./MetricCard";

const templates = [
  "A 3-step guide to improve your cooking",
  "Unboxing the new Acme phone",
  "My top 5 tips for learning a new language",
  "A day in the life of a software engineer",
];

export const Demo = () => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    if (!topic) return;
    setIsLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(
        `**Hook:** You've been making coffee wrong your whole life.\n\n**Script:**\n1. Start with fresh, whole beans.\n2. Grind them right before you brew.\n3. Use water that's just off the boil.\n\n**CTA:** Follow for more coffee tips!`
      );
      setIsLoading(false);
    }, 2000);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      // You can add a toast notification here to confirm the copy
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
            Try our AI script generator below. See how easy it is to create
            viral content. No sign-up required.
          </p>
        </div>

        {/* Demo Sandbox */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-secondary/30 border border-border rounded-2xl p-8">
            {/* Input Section */}
            <div>
              <label htmlFor="topic" className="font-semibold">
                What's your video about?
              </label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., A tutorial on how to make the perfect cold brew coffee"
                className="mt-2"
                rows={3}
              />
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Or try one of our templates:
                </p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className="px-3 py-1 bg-secondary/50 text-sm rounded-md hover:bg-secondary"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="my-8 border-t border-border" />

            {/* Action */}
            <div className="text-center">
              <Button onClick={handleGenerate} disabled={isLoading || !topic}>
                {isLoading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            </div>

            {/* Result Section */}
            {result && (
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Your Viral Script</h3>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-background/50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {result}
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <MetricCard
                    icon={TrendingUp}
                    label="Viral Score"
                    value="8.7/10"
                    note="(Simulated)"
                  />
                  <MetricCard
                    icon={Film}
                    label="Est. Video Length"
                    value="45s"
                    note="(Simulated)"
                  />
                  <MetricCard
                    icon={Sparkles}
                    label="Hook Strength"
                    value="Strong"
                    note="(Simulated)"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
