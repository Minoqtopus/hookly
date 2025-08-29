import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import Link from "next/link";

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
            <Button className="w-full">Upgrade Now</Button>
        </Link>
    </div>
);

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">
          Here's a quick overview of your account.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Generations Used"
          value="5 / 15"
          description="Trial Plan"
        />
        <StatCard
          title="Viral Score Average"
          value="8.2"
          description="Across all content"
        />
        <StatCard
          title="Next Billing Date"
          value="N/A"
          description="Trial ends in 12 days"
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