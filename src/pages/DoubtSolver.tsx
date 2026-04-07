import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Camera, Loader2, HelpCircle, X } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const DoubtSolver = () => {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show image preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Extract text using OCR via canvas for images
    if (file.type.startsWith("image/")) {
      setExtracting(true);
      try {
        // Use the AI with a description approach - describe the image content
        // For MVP, we'll ask users to also type the question if OCR isn't available
        toast.info("Image loaded! Please also type the question below if the text isn't clear.");
        setExtractedText(`[Image uploaded: ${file.name}] `);
      } catch {
        toast.error("Could not process image");
      } finally {
        setExtracting(false);
      }
    } else if (file.type === "application/pdf" || file.type === "text/plain") {
      // Read text files directly
      setExtracting(true);
      try {
        const text = await file.text();
        setExtractedText(text.slice(0, 3000));
        toast.success("File content extracted!");
      } catch {
        toast.error("Could not read file");
      } finally {
        setExtracting(false);
      }
    } else {
      toast.error("Supported: images, text files, PDFs");
    }
  };

  const solveDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = (extractedText + "\n" + textInput).trim();
    if (!question) { toast.error("Enter or upload a question"); return; }

    setLoading(true);
    setSolution(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { feature: "doubt", content: question },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setSolution(data.content);
    } catch (err: any) {
      toast.error(err.message || "Failed to solve doubt");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setTextInput("");
    setImagePreview(null);
    setExtractedText("");
    setSolution(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10">
          <HelpCircle className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">Doubt Solver</h1>
          <p className="text-xs text-muted-foreground">Upload or type a question — get a full solution</p>
        </div>
      </header>

      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Upload Area */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Upload Question</h2>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,.txt,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!imagePreview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-sky-400" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-violet-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Upload image, screenshot, or text file</p>
              <p className="text-xs text-muted-foreground">Supports: JPG, PNG, TXT, PDF</p>
            </button>
          ) : (
            <div className="relative">
              <img src={imagePreview} alt="Question" className="w-full max-h-64 object-contain rounded-xl" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-background/80"
                onClick={() => { setImagePreview(null); setExtractedText(""); if (fileRef.current) fileRef.current.value = ""; }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {extracting && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Extracting text...
            </div>
          )}
        </div>

        {/* Text Input */}
        <form onSubmit={solveDoubt} className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Type or describe your doubt</h2>
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your question here... e.g. 'Solve the quadratic equation x² + 5x + 6 = 0' or describe what's in the uploaded image"
              className="bg-secondary border-border min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || (!textInput.trim() && !extractedText.trim())} className="flex-1 gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Solving...</> : "Solve My Doubt"}
            </Button>
            {(solution || textInput || imagePreview) && (
              <Button type="button" variant="outline" onClick={clearAll}>Clear</Button>
            )}
          </div>
        </form>

        {/* Solution */}
        {solution && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-sky-400" /> Solution
            </h2>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{solution}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtSolver;
