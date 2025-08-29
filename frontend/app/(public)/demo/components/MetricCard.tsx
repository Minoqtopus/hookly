import { LucideProps } from "lucide-react";

interface MetricCardProps {
  icon: React.ElementType<LucideProps>;
  label: string;
  value: string;
  note?: string;
}

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  note,
}: MetricCardProps) => {
  return (
    <div className="p-4 bg-secondary/50 rounded-lg">
      <Icon className="w-6 h-6 mx-auto text-primary" />
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{value}</p>
      {note && (
        <p className="text-xs text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
};
