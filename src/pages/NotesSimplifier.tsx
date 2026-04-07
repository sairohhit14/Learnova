import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const NotesSimplifier = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSimplify = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { content: notes, feature: "notes" },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setResult(data.content);
      toast.success("Notes simplified!");
    } catch (err: any) {
      toast.error(err.message || "Failed to simplify notes");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
            <FileText className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Notes Simplifier</h1>
            <p className="text-xs text-muted-foreground">Paste notes → get key concepts</p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Your Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your long notes here..."
              rows={14}
              className="w-full rounded-xl border border-border bg-secondary p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <Button
              onClick={handleSimplify}
              disabled={loading || !notes.trim()}
              className="w-full gradient-primary text-primary-foreground py-5 font-semibold glow-primary hover:opacity-90"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Simplifying...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Simplify Notes</>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Simplified</label>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-4 min-h-[340px]">
              {result ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center mt-20">
                  Simplified notes will appear here
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesSimplifier;
