import { useState } from "react";
import { Link, FileText, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchSectionProps {
  onAnalyze: (input: string, type: "url" | "text") => void;
  isLoading: boolean;
}

export const SearchSection = ({ onAnalyze, isLoading }: SearchSectionProps) => {
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAnalyze(inputValue, inputType);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-8 mb-8">
      <h2 className="text-2xl font-bold text-center text-foreground mb-2">
        Verify Before You Share
      </h2>
      <p className="text-center text-muted-foreground mb-6">
        Paste a URL or text to instantly analyze for misinformation
      </p>

      {/* Toggle Tabs */}
      <div className="flex rounded-lg bg-secondary p-1 mb-4">
        <button
          onClick={() => setInputType("url")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-all",
            inputType === "url" 
              ? "bg-muted text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link className="h-4 w-4" />
          URL
        </button>
        <button
          onClick={() => setInputType("text")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-all",
            inputType === "text" 
              ? "bg-muted text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4" />
          Text
        </button>
      </div>

      {/* Input Field */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        {inputType === "url" ? (
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full rounded-lg border border-primary/50 bg-secondary py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ) : (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste the text you want to verify..."
            rows={4}
            className="w-full rounded-lg border border-primary/50 bg-secondary py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        )}
      </div>

      {/* Analyze Button */}
      <Button 
        onClick={handleSubmit}
        disabled={isLoading || !inputValue.trim()}
        className="w-full gradient-primary text-primary-foreground py-6 text-lg font-semibold glow-primary hover:opacity-90 transition-opacity"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {isLoading ? "Analyzing..." : "Analyze for Misinformation"}
      </Button>
    </div>
  );
};
