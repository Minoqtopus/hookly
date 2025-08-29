import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: string[];
    isRecommended: boolean;
  };
}

export const PricingCard = ({ plan }: PricingCardProps) => {
  return (
    <div
      className={cn(
        "rounded-3xl p-8 ring-1 ring-border",
        plan.isRecommended
          ? "bg-secondary/30 ring-2 ring-primary"
          : "bg-secondary/10"
      )}
    >
      <h3 className="text-2xl font-semibold leading-7">{plan.name}</h3>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {plan.description}
      </p>
      <p className="mt-6 flex items-baseline gap-x-2">
        <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
        <span className="text-sm font-semibold leading-6 text-muted-foreground">
          /month
        </span>
      </p>
      <Button
        className="mt-8 w-full"
        variant={plan.isRecommended ? "default" : "outline"}
      >
        Get Started
      </Button>
      <ul
        role="list"
        className="mt-8 space-y-4 text-sm leading-6 text-muted-foreground"
      >
        <li className="font-semibold text-foreground">What's included:</li>
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-x-3">
            <Check className="h-6 w-5 flex-none text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};
