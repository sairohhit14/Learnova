import { TrendingUp, CheckCircle, XCircle, Shield } from "lucide-react";
import { StatsCard } from "./StatsCard";

interface StatsGridProps {
  totalAnalyzed: number;
  verifiedTrue: number;
  fakeMisleading: number;
  avgTrustScore: number;
}

export const StatsGrid = ({ totalAnalyzed, verifiedTrue, fakeMisleading, avgTrustScore }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard 
        icon={TrendingUp} 
        label="Total Analyzed" 
        value={totalAnalyzed}
        iconColor="text-muted-foreground"
      />
      <StatsCard 
        icon={CheckCircle} 
        label="Verified True" 
        value={verifiedTrue}
        iconColor="text-success"
      />
      <StatsCard 
        icon={XCircle} 
        label="Fake/Misleading" 
        value={fakeMisleading}
        iconColor="text-destructive"
      />
      <StatsCard 
        icon={Shield} 
        label="Avg Trust Score" 
        value={avgTrustScore}
        iconColor="text-primary"
      />
    </div>
  );
};
