import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconColor?: string;
}

export const StatsCard = ({ icon: Icon, label, value, iconColor = "text-muted-foreground" }: StatsCardProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span>{label}</span>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
};
