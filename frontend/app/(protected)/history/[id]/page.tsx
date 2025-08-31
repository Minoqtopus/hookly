"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGeneration } from "@/domains/generation";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Zap,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { generations, isLoading } = useGeneration();
  const [copySuccess, setCopySuccess] = useState(false);

  const generation = useMemo(() => {
    if (!params.id || !generations.length) return null;
    return generations.find((gen) => gen.id === params.id);
  }, [params.id, generations]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const calculateViralScore = (gen: any) => {
    if (gen.performance_data) {
      const { views, clicks, engagement_rate } = gen.performance_data;
      return Math.min(
        10,
        (engagement_rate + (clicks / views) * 100) / 2
      ).toFixed(1);
    }
    return "5.0";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>
        <div className="text-center py-8">
          <p>Loading UGC script details...</p>
        </div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>
        <div className="text-center py-8">
          <p>UGC script not found or still loading.</p>
          <Button onClick={() => router.push("/history")} className="mt-4">
            Return to History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {generation.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Created on{" "}
              {new Date(generation.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="capitalize px-4 py-2 text-sm">
              {generation.platform}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              {calculateViralScore(generation)}/10
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* UGC Script Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>UGC Script Content</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      `**Title:** ${generation.title}\n\n**Hook:** ${generation.hook}\n\n**Script:**\n${generation.script}`
                    )
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copySuccess ? "Copied!" : "Copy All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Title
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generation.title)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed font-medium">
                    {generation.title}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Hook */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Hook
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generation.hook)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{generation.hook}</p>
                </div>
              </div>

              <Separator />

              {/* Script */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Full Script
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generation.script)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {generation.script}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Niche
                  </label>
                  <p className="mt-1">{generation.niche}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Platform
                  </label>
                  <p className="mt-1 capitalize">{generation.platform}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Target Audience
                  </label>
                  <p className="mt-1">{generation.target_audience}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Performance Metrics */}
        <div className="space-y-6">
          {generation.performance_data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Projected performance based on viral patterns
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">
                      {formatNumber(generation.performance_data.views)}
                    </p>
                    <p className="text-sm text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <MousePointer className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">
                      {formatNumber(generation.performance_data.clicks)}
                    </p>
                    <p className="text-sm text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold">
                      {generation.performance_data.ctr.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">CTR</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold">
                      {generation.performance_data.engagement_rate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                  </div>
                </div>

                <Separator />

                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {calculateViralScore(generation)}/10
                  </p>
                  <p className="text-sm text-muted-foreground">Viral Score</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on engagement patterns and CTR
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  handleCopy(
                    `**Title:** ${generation.title}\n\n**Hook:** ${generation.hook}\n\n**Script:**\n${generation.script}`
                  )
                }
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Full Script
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/generate")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Similar Script
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
