import { cn } from "@/lib/utils";

interface TrustScoreGaugeProps {
  score: number;
  status: "verified" | "misleading";
}

export const TrustScoreGauge = ({ score, status }: TrustScoreGaugeProps) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const statusColors = {
    verified: "text-success",
    misleading: "text-destructive",
  };

  const statusBg = {
    verified: "bg-success/20 text-success",
    misleading: "bg-destructive/20 text-destructive",
  };

  const strokeColors = {
    verified: "stroke-success",
    misleading: "stroke-destructive",
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative trust-score-ring">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={cn(strokeColors[status], "transition-all duration-1000")}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-5xl font-bold", statusColors[status])}>
            {score}
          </span>
          <span className="text-sm text-muted-foreground">Trust Score</span>
        </div>
      </div>
      <span className={cn("mt-4 px-4 py-1.5 rounded-full text-sm font-medium capitalize", statusBg[status])}>
        {status}
      </span>
    </div>
  );
};
