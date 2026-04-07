import { Shield, Globe, MessageSquare, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreakdownItem {
  label: string;
  description: string;
  score: number;
  icon: React.ReactNode;
}

interface AnalysisBreakdownProps {
  breakdown: {
    factualAccuracy: number;
    sourceReliability: number;
    languageNeutrality: number;
    crossReference: number;
  };
}

export const AnalysisBreakdown = ({ breakdown }: AnalysisBreakdownProps) => {
  const items: BreakdownItem[] = [
    {
      label: "Factual Accuracy",
      description: "Claims verified against reliable sources",
      score: breakdown.factualAccuracy,
      icon: <Shield className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Source Reliability",
      description: "Publisher credibility and track record",
      score: breakdown.sourceReliability,
      icon: <Globe className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Language Neutrality",
      description: "Absence of emotional or biased language",
      score: breakdown.languageNeutrality,
      icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Cross-Reference",
      description: "Corroboration from other sources",
      score: breakdown.crossReference,
      icon: <Link2 className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Breakdown</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {item.icon}
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">{item.score}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", getBarColor(item.score))}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
