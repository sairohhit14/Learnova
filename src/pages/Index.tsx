import { useState } from "react";
import { Header } from "@/components/Header";
import { StatsGrid } from "@/components/StatsGrid";
import { SearchSection } from "@/components/SearchSection";
import { AnalysisResults, AnalysisResult } from "@/components/AnalysisResults";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    verifiedTrue: 0,
    fakeMisleading: 0,
    avgTrustScore: 0,
  });
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  const handleAnalyze = async (input: string, type: "url" | "text") => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: { content: input, type }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error(error.message || 'Failed to analyze content');
        setIsLoading(false);
        return;
      }

      if (data.error) {
        console.error('Analysis error:', data.error);
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      // Transform the response to match our AnalysisResult type
      const analysisResult: AnalysisResult = {
        trustScore: data.trustScore,
        status: data.isTrue ? "verified" : "misleading",
        title: data.title,
        summary: data.summary,
        breakdown: data.breakdown,
        redFlags: data.redFlags || [],
        claims: data.claims?.map((claim: any) => ({
          text: claim.text,
          status: claim.status as "verified" | "false" | "unverified",
          explanation: claim.explanation,
        })) || [],
        sources: data.sources || [],
      };

      setResult(analysisResult);
      
      // Update history
      const newHistory = [analysisResult, ...analysisHistory];
      setAnalysisHistory(newHistory);
      
      // Update stats - Verified True for TRUE news, Fake/Misleading for FALSE news
      const newTotal = stats.totalAnalyzed + 1;
      const newVerified = analysisResult.status === "verified" 
        ? stats.verifiedTrue + 1 
        : stats.verifiedTrue;
      const newFake = analysisResult.status === "misleading"
        ? stats.fakeMisleading + 1 
        : stats.fakeMisleading;
      
      // Calculate new average
      const allScores = newHistory.map(h => h.trustScore);
      const newAvg = Math.floor(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      
      setStats({
        totalAnalyzed: newTotal,
        verifiedTrue: newVerified,
        fakeMisleading: newFake,
        avgTrustScore: newAvg,
      });
      
      toast.success("Analysis complete!");
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = () => {
    if (analysisHistory.length === 0) {
      toast.info("No analysis history yet. Start by analyzing some content!");
    } else {
      toast.info(`You have ${analysisHistory.length} previous analysis${analysisHistory.length > 1 ? 'es' : ''}.`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container max-w-6xl mx-auto px-4">
        <Header onHistoryClick={handleHistoryClick} />
        
        <StatsGrid
          totalAnalyzed={stats.totalAnalyzed}
          verifiedTrue={stats.verifiedTrue}
          fakeMisleading={stats.fakeMisleading}
          avgTrustScore={stats.avgTrustScore}
        />
        
        <SearchSection onAnalyze={handleAnalyze} isLoading={isLoading} />
        
        {result && <AnalysisResults result={result} />}
      </div>
    </div>
  );
};

export default Index;
