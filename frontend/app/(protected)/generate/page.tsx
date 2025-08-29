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
import { Copy, Sparkles } from "lucide-react";
import { useState } from "react";

// This would come from an API in a real app
const recentGenerations = [
  {
    id: 1,
    topic: "My top 5 tips for learning a new language",
    date: "2 days ago",
    platform: "TikTok",
  },
  {
    id: 2,
    topic: "Unboxing the new Acme phone",
    date: "4 days ago",
    platform: "YouTube",
  },
  {
    id: 3,
    topic: "A 3-step guide to improve your cooking",
    date: "1 week ago",
    platform: "Instagram",
  },
];

export default function GeneratePage() {
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
              <Label htmlFor="topic">Topic or Idea</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to make the perfect cold brew"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select defaultValue="tiktok">
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter" disabled>
                    <div className="flex items-center justify-between">
                      <span>X (Twitter)</span>
                      <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 ml-4">
                        PRO
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
              disabled={isLoading || !topic}
              className="w-full"
            >
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Script
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
            <CardTitle>Generated Script</CardTitle>
            <CardDescription>
              Your AI-generated script will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {result ? (
              <div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="mt-2 p-4 bg-secondary rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {result}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Waiting for generation...
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
              {recentGenerations.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.date}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.platform}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}