import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Brain, Sparkles, Loader2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const QuizGenerator = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setSelected({});
    setSubmitted(false);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { content: topic, feature: "quiz" },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setQuestions(data.questions || []);
      toast.success("Quiz ready!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const correct = questions.reduce(
      (acc, q, i) => acc + (selected[i] === q.correctIndex ? 1 : 0),
      0
    );
    setScore(correct);
    setSubmitted(true);

    // Save result
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        topic,
        score: correct,
        total_questions: questions.length,
      });

      // Award points
      const points = correct * 10;
      if (points > 0) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("points, level")
          .eq("id", user.id)
          .single();
        if (profile) {
          const newPoints = profile.points + points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          await supabase.from("profiles").update({
            points: newPoints,
            level: newLevel,
          }).eq("id", user.id);
        }
      }
    }

    toast.success(`You scored ${correct}/${questions.length}! (+${correct * 10} points)`);
  };

  const reset = () => {
    setQuestions([]);
    setSelected({});
    setSubmitted(false);
    setTopic("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <header className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <Brain className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Quiz Generator</h1>
            <p className="text-xs text-muted-foreground">Test your knowledge</p>
          </div>
        </header>

        {questions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-6">Enter a topic to generate a quiz</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., DBMS, Binary Search, Photosynthesis"
                className="bg-secondary border-border"
                onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
              />
              <Button
                onClick={generateQuiz}
                disabled={loading || !topic.trim()}
                className="gradient-primary text-primary-foreground"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["DBMS", "Data Structures", "Operating Systems", "Machine Learning"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {submitted && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold gradient-text mb-1">{score}/{questions.length}</p>
                <p className="text-muted-foreground text-sm">+{score * 10} points earned</p>
                <Button onClick={reset} variant="ghost" className="mt-3">
                  <RotateCcw className="h-4 w-4 mr-2" />Try Another Quiz
                </Button>
              </div>
            )}

            {questions.map((q, qi) => (
              <div key={qi} className="glass-card rounded-2xl p-6">
                <p className="text-sm font-medium text-foreground mb-4">
                  <span className="text-primary mr-2">Q{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected[qi] === oi;
                    const isCorrect = submitted && oi === q.correctIndex;
                    const isWrong = submitted && isSelected && oi !== q.correctIndex;

                    return (
                      <button
                        key={oi}
                        onClick={() => !submitted && setSelected({ ...selected, [qi]: oi })}
                        disabled={submitted}
                        className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                          isCorrect
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                            : isWrong
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : isSelected
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border hover:border-border/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                          {isWrong && <XCircle className="h-4 w-4 text-destructive" />}
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="text-xs text-muted-foreground mt-3 p-3 rounded-lg bg-secondary">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {!submitted && (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(selected).length < questions.length}
                className="w-full gradient-primary text-primary-foreground py-5 font-semibold glow-primary hover:opacity-90"
              >
                Submit Quiz ({Object.keys(selected).length}/{questions.length} answered)
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGenerator;
