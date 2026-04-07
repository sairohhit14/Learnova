import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Timer, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const MockTest = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("10");
  const [duration, setDuration] = useState("15");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);

  // Timer
  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted, timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (started && !submitted && timeLeft === 0 && questions.length > 0) {
      handleSubmit();
      toast.warning("Time's up! Test auto-submitted.");
    }
  }, [timeLeft, started, submitted, questions.length]);

  const startTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);

    try {
      // Generate questions in batches if needed
      const count = Math.min(parseInt(numQuestions) || 10, 20);
      const prompt = `Generate exactly ${count} multiple-choice questions about: ${topic.trim()}. Make them progressively harder.`;
      
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { feature: "quiz", content: prompt },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      const qs = data.questions || [];
      setQuestions(qs);
      setAnswers({});
      setSubmitted(false);
      setTimeLeft(parseInt(duration) * 60);
      setStarted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate test");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setStarted(false);

    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);

    // Save result
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("quiz_results").insert({
          user_id: user.id,
          topic: topic,
          score: correct,
          total_questions: questions.length,
        }).then(() => {
          // Award points
          supabase.from("profiles").select("points").eq("id", user.id).single().then(({ data: profile }) => {
            if (profile) {
              const bonus = score >= 80 ? correct * 15 : correct * 10;
              supabase.from("profiles").update({ points: profile.points + bonus }).eq("id", user.id).then(() => {});
            }
          });
        });
      }
    });
  }, [questions, answers, topic]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const score = submitted
    ? questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;
  const percentage = submitted ? Math.round((score / questions.length) * 100) : 0;

  const reset = () => {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setStarted(false);
    setTopic("");
    setTimeLeft(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
          <Timer className="h-5 w-5 text-red-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-foreground">Mock Test</h1>
          <p className="text-xs text-muted-foreground">Simulate real exams</p>
        </div>
        {started && !submitted && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${
            timeLeft < 60 ? "bg-destructive/20 text-destructive animate-pulse" : "glass-card text-foreground"
          }`}>
            <Timer className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </header>

      <div className="container max-w-3xl mx-auto px-4 py-6">
        {/* Setup */}
        {!started && !submitted && questions.length === 0 && (
          <form onSubmit={startTest} className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Configure Your Test</h2>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Topic</label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Data Structures, World War II, Organic Chemistry" className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Questions</label>
                <Input type="number" min="5" max="20" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Duration (min)</label>
                <Input type="number" min="5" max="60" value={duration} onChange={(e) => setDuration(e.target.value)} className="bg-secondary border-border" />
              </div>
            </div>
            <Button type="submit" disabled={loading || !topic.trim()} className="w-full gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating Test...</> : "Start Mock Test"}
            </Button>
          </form>
        )}

        {/* Questions */}
        {questions.length > 0 && !submitted && (
          <div className="space-y-6">
            {questions.map((q, qi) => (
              <div key={qi} className="glass-card rounded-2xl p-5">
                <p className="text-sm font-semibold text-foreground mb-3">
                  <span className="text-primary mr-2">Q{qi + 1}.</span>{q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers({ ...answers, [qi]: oi })}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                        answers[qi] === oi
                          ? "gradient-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground" size="lg">
              Submit Test
            </Button>
          </div>
        )}

        {/* Results */}
        {submitted && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className={`inline-flex h-24 w-24 items-center justify-center rounded-full mb-4 ${
                percentage >= 80 ? "bg-emerald-500/20" : percentage >= 50 ? "bg-amber-500/20" : "bg-destructive/20"
              }`}>
                <span className={`text-3xl font-bold ${
                  percentage >= 80 ? "text-emerald-400" : percentage >= 50 ? "text-amber-400" : "text-destructive"
                }`}>{percentage}%</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{score}/{questions.length} Correct</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {percentage >= 80 ? "🎉 Excellent!" : percentage >= 50 ? "👍 Good effort!" : "📚 Keep practicing!"}
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <Button onClick={reset} variant="outline">New Test</Button>
                <Button onClick={() => navigate("/dashboard")} className="gradient-primary text-primary-foreground">Dashboard</Button>
              </div>
            </div>

            {/* Review */}
            <h3 className="text-lg font-semibold text-foreground">Review Answers</h3>
            {questions.map((q, qi) => {
              const correct = answers[qi] === q.correctIndex;
              const unanswered = answers[qi] === undefined;
              return (
                <div key={qi} className={`glass-card rounded-2xl p-5 border-l-4 ${
                  correct ? "border-l-emerald-500" : "border-l-destructive"
                }`}>
                  <div className="flex items-start gap-2 mb-3">
                    {correct ? <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" /> :
                     unanswered ? <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" /> :
                     <XCircle className="h-5 w-5 text-destructive mt-0.5" />}
                    <p className="text-sm font-semibold text-foreground">{q.question}</p>
                  </div>
                  <div className="space-y-1 mb-3">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`px-3 py-2 rounded-lg text-sm ${
                        oi === q.correctIndex ? "bg-emerald-500/10 text-emerald-400" :
                        oi === answers[qi] && oi !== q.correctIndex ? "bg-destructive/10 text-destructive" :
                        "text-muted-foreground"
                      }`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                        {oi === q.correctIndex && " ✓"}
                        {oi === answers[qi] && oi !== q.correctIndex && " ✗"}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTest;
