"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/domains/auth";
import { useGeneration } from "@/domains/generation";
import { Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => (
  <div className="bg-secondary/30 border border-border rounded-lg p-6">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <p className="mt-2 text-3xl font-bold">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
  </div>
);

const ActionCard = ({
  title,
  description,
  href,
  icon: Icon,
  buttonLabel,
}: {
  title:string;
  description:string;
  href:string;
  icon: React.ElementType;
  buttonLabel:string;
}) => (
  <div className="bg-secondary/30 border border-border rounded-lg p-6 flex flex-col">
    <div className="flex-1">
      <Icon className="w-8 h-8 text-primary mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
    <Link href={href} className="mt-6">
      <Button className="w-full">{buttonLabel}</Button>
    </Link>
  </div>
);

const UpgradeCard = () => (
    <div className="bg-secondary/30 border-2 border-primary rounded-lg p-6 flex flex-col">
        <div className="flex-1">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold">Unlock Pro Features</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Unlimited Generations</span>
                </li>
                <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Access to All Platforms</span>
                </li>
                <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Premium AI Models</span>
                </li>
            </ul>
        </div>
        <Link href="/pricing" className="mt-6">
            <Button className="w-full bg-white text-black hover:bg-gray-50 border border-gray-200 font-semibold">Upgrade to Pro</Button>
        </Link>
    </div>
);

export default function DashboardPage() {
  const { user, remainingGenerations, isLoading: authLoading } = useAuth();
  const { viralScoreAverage, isLoading: generationLoading } = useGeneration();

  // Calculate dynamic values
  const generationsUsed = user?.trial_generations_used || 0;
  const totalGenerations = 5; // All trial users get 5 generations regardless of verification status
  const displayName = user?.first_name || user?.email?.split('@')[0] || 'User';
  
  // Calculate trial status
  const trialDaysRemaining = useMemo(() => {
    if (!user?.trial_ends_at) return 'Unknown';
    
    const trialEnd = new Date(user.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    return `${diffDays} days`;
  }, [user?.trial_ends_at]);

  const planDisplayName = user?.plan === 'trial' ? 'Trial Plan' : 
                         user?.plan === 'starter' ? 'Starter Plan' :
                         user?.plan === 'pro' ? 'Pro Plan' : 'Trial Plan';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's a quick overview of your account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Generations Used"
          value={authLoading ? "Loading..." : `${generationsUsed} / ${totalGenerations}`}
          description={planDisplayName}
        />
        <StatCard
          title="Viral Score Average"
          value={generationLoading ? "Loading..." : viralScoreAverage.toString()}
          description="Across all content"
        />
        <StatCard
          title="Trial Status"
          value={user?.plan === 'trial' ? trialDaysRemaining : 'Active'}
          description={user?.plan === 'trial' ? `Trial ends in ${trialDaysRemaining}` : 'Subscription active'}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActionCard
          title="Create New Content"
          description="Start generating a new viral script with our powerful AI."
          href="/generate"
          icon={Sparkles}
          buttonLabel="Generate Script"
        />
        <UpgradeCard />
      </div>
    </div>
  );
}