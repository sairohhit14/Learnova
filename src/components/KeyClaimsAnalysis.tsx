import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Claim {
  text: string;
  status: "verified" | "false" | "unverified";
  explanation: string;
}

interface KeyClaimsAnalysisProps {
  claims: Claim[];
}

export const KeyClaimsAnalysis = ({ claims }: KeyClaimsAnalysisProps) => {
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/20",
      label: "Verified",
    },
    false: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/20",
      label: "False",
    },
    unverified: {
      icon: AlertCircle,
      color: "text-warning",
      bg: "bg-warning/20",
      label: "Unverified",
    },
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Key Claims Analysis</h3>
      <div className="space-y-4">
        {claims.map((claim, index) => {
          const config = statusConfig[claim.status];
          const Icon = config.icon;
          
          return (
            <div key={index} className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-1 rounded-full", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded", config.bg, config.color)}>
                    {config.label}
                  </span>
                  <p className="text-sm font-medium text-foreground mt-2">
                    "{claim.text}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {claim.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
