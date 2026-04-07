import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Layers, Sparkles, Loader2, ChevronLeft, ChevronRight, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

type Flashcard = { question: string; answer: string };

const cardGradients = [
  "from-violet-600 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-700",
  "from-fuchsia-500 to-purple-600",
  "from-lime-500 to-green-600",
];

const cardEmojis = ["🧠", "💡", "⚡", "🔬", "📐", "🎯", "🌟", "🔥"];

const Flashcards = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());

  const generateCards = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { content: topic, feature: "flashcards" },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setCards(data.flashcards || []);
      toast.success("Flashcards ready! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  const next = () => { setFlipped(false); setCurrentIndex((i) => Math.min(i + 1, cards.length - 1)); };
  const prev = () => { setFlipped(false); setCurrentIndex((i) => Math.max(i - 1, 0)); };

  const markKnown = () => {
    setKnown((s) => new Set(s).add(currentIndex));
    setUnknown((s) => { const n = new Set(s); n.delete(currentIndex); return n; });
    if (currentIndex < cards.length - 1) next();
  };

  const markUnknown = () => {
    setUnknown((s) => new Set(s).add(currentIndex));
    setKnown((s) => { const n = new Set(s); n.delete(currentIndex); return n; });
    if (currentIndex < cards.length - 1) next();
  };

  const reset = () => { setCards([]); setTopic(""); setCurrentIndex(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set()); };

  const gradient = cardGradients[currentIndex % cardGradients.length];
  const emoji = cardEmojis[currentIndex % cardEmojis.length];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
            <Layers className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Auto Flashcards</h1>
            <p className="text-xs text-muted-foreground">Learn with colorful flip cards</p>
          </div>
        </header>

        {cards.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🃏</div>
            <p className="text-muted-foreground mb-6">Enter a topic to generate flashcards</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Binary Search, Networking, SQL"
                className="bg-secondary border-border"
                onKeyDown={(e) => e.key === "Enter" && generateCards()}
              />
              <Button onClick={generateCards} disabled={loading || !topic.trim()} className="gradient-primary text-primary-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["React Hooks", "SQL Joins", "Newton's Laws"].map((s) => (
                <button key={s} onClick={() => setTopic(s)} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-mono">{currentIndex + 1}/{cards.length}</span>
            </div>

            {/* Score indicators */}
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-emerald-400">✓ {known.size} known</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-rose-400">✗ {unknown.size} to review</span>
            </div>

            {/* Card */}
            <div className="flex justify-center" style={{ perspective: "1200px" }}>
              <button
                onClick={() => setFlipped(!flipped)}
                className="w-full max-w-lg h-80 relative cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 rounded-3xl transition-transform duration-600 ease-in-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* Front */}
                  <div
                    className={`absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center bg-gradient-to-br ${gradient} shadow-2xl`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="text-4xl mb-4">{emoji}</span>
                    <p className="text-xs uppercase tracking-[0.2em] mb-3 opacity-80 text-white/80">Question</p>
                    <p className="text-xl font-semibold text-white text-center leading-relaxed">
                      {cards[currentIndex]?.question}
                    </p>
                    <p className="text-xs mt-6 opacity-60 text-white/60">Tap to reveal answer</p>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-3xl p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl border border-white/10"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <span className="text-4xl mb-4">✨</span>
                    <p className="text-xs uppercase tracking-[0.2em] mb-3 text-emerald-400">Answer</p>
                    <p className="text-lg text-white text-center leading-relaxed">
                      {cards[currentIndex]?.answer}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Know / Don't Know buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={markUnknown}
                variant="outline"
                className="gap-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                <ThumbsDown className="h-4 w-4" /> Review Later
              </Button>
              <Button
                onClick={markKnown}
                variant="outline"
                className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <ThumbsUp className="h-4 w-4" /> Got It!
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" onClick={prev} disabled={currentIndex === 0}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {/* Card dots */}
              <div className="flex gap-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setFlipped(false); setCurrentIndex(i); }}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      i === currentIndex
                        ? "bg-primary scale-125"
                        : known.has(i)
                        ? "bg-emerald-500"
                        : unknown.has(i)
                        ? "bg-rose-500"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={next} disabled={currentIndex === cards.length - 1}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-center">
              <Button onClick={reset} variant="ghost" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" /> New Topic
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
