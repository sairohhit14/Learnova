import { TrustScoreGauge } from "./TrustScoreGauge";
import { AnalysisBreakdown } from "./AnalysisBreakdown";
import { RedFlagsSection } from "./RedFlagsSection";
import { KeyClaimsAnalysis } from "./KeyClaimsAnalysis";
import { CrossReferenceSources } from "./CrossReferenceSources";

export interface AnalysisResult {
  trustScore: number;
  status: "verified" | "misleading";
  title: string;
  summary: string;
  breakdown: {
    factualAccuracy: number;
    sourceReliability: number;
    languageNeutrality: number;
    crossReference: number;
  };
  redFlags: string[];
  claims: {
    text: string;
    status: "verified" | "false" | "unverified";
    explanation: string;
  }[];
  sources: {
    name: string;
    url: string;
  }[];
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Trust Score */}
          <div className="flex flex-col items-center justify-center">
            <TrustScoreGauge score={result.trustScore} status={result.status} />
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold text-foreground">{result.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <AnalysisBreakdown breakdown={result.breakdown} />
        </div>
      </div>

      {/* Red Flags */}
      <RedFlagsSection redFlags={result.redFlags} />

      {/* Claims and Sources Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <KeyClaimsAnalysis claims={result.claims} />
        <CrossReferenceSources sources={result.sources} />
      </div>
    </div>
  );
};
