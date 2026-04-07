import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CalendarDays, Loader2, Lightbulb, Target, Clock, Layout, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Slot = { time: string; subject: string; topic: string; type: string };
type DayPlan = { day: string; slots: Slot[] };
type PlanResult = { timetable: DayPlan[]; tips: string[]; weeklyGoals: string[] };

// Helper function to get all unique time slots across the week
const getTimeSlots = (timetable: DayPlan[]): string[] => {
  const timeSlots = new Set<string>();
  timetable.forEach(day => {
    day.slots.forEach(slot => {
      timeSlots.add(slot.time);
    });
  });
  return Array.from(timeSlots).sort();
};

const StudyPlanner = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState("");
  const [hours, setHours] = useState("6");
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [viewMode, setViewMode] = useState<"cards" | "table" | "weekly">("cards");

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjects.trim()) { toast.error("Enter your subjects"); return; }
    setLoading(true);
    setPlan(null);

    const prompt = `Create a weekly study timetable for a student studying: ${subjects.trim()}.
Available study hours per day: ${hours} hours.
${examDate ? `Exam date: ${examDate}` : "No specific exam date."}
Prioritize harder subjects in morning slots. Include short breaks.`;

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: { feature: "timetable", content: prompt },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setPlan(data);
      setActiveDay(0);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
          <CalendarDays className="h-5 w-5 text-rose-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">Study Planner</h1>
          <p className="text-xs text-muted-foreground">AI-generated timetable & study plan</p>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {!plan && (
          <form onSubmit={generatePlan} className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Subjects / Topics</label>
              <Input
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="e.g. Mathematics, Physics, Chemistry, English"
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate subjects with commas</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Hours/day</label>
                <Input
                  type="number"
                  min="1"
                  max="16"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Exam date (optional)</label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : "Generate Study Plan"}
            </Button>
          </form>
        )}

        {plan && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your Weekly Timetable</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                    className="h-8 px-3"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-8 px-3"
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === "weekly" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("weekly")}
                    className="h-8 px-3"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPlan(null)}>New Plan</Button>
              </div>
            </div>

            {/* Day Tabs - Only show for cards and single day table view */}
            {(viewMode === "cards" || viewMode === "table") && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {plan.timetable.map((day, i) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(i)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeDay === i
                        ? "gradient-primary text-primary-foreground"
                        : "glass-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            )}

            {/* Schedule - Cards View */}
            {viewMode === "cards" && (
              <div className="space-y-2">
                {plan.timetable[activeDay]?.slots.map((slot, i) => (
                  <div
                    key={i}
                    className={`glass-card rounded-xl p-4 flex items-center gap-4 ${
                      slot.type === "break" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{slot.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{slot.subject}</p>
                      {slot.topic && <p className="text-xs text-muted-foreground">{slot.topic}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      slot.type === "break"
                        ? "bg-muted text-muted-foreground"
                        : slot.type === "revision"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-violet-500/10 text-violet-400"
                    }`}>
                      {slot.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Schedule - Table View */}
            {viewMode === "table" && (
              <div className="glass-card rounded-xl p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.timetable[activeDay]?.slots.map((slot, i) => (
                      <TableRow key={i} className={slot.type === "break" ? "opacity-60" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {slot.time}
                          </div>
                        </TableCell>
                        <TableCell>{slot.subject}</TableCell>
                        <TableCell className="text-muted-foreground">{slot.topic || "-"}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            slot.type === "break"
                              ? "bg-muted text-muted-foreground"
                              : slot.type === "revision"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-violet-500/10 text-violet-400"
                          }`}>
                            {slot.type}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Schedule - Weekly Table View */}
            {viewMode === "weekly" && (
              <div className="glass-card rounded-xl p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Complete Weekly Schedule</h3>
                  <p className="text-xs text-muted-foreground">View your entire week at a glance</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Time</TableHead>
                        {plan.timetable.map((day) => (
                          <TableHead key={day.day} className="text-center min-w-[100px]">
                            {day.day}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getTimeSlots(plan.timetable).map((timeSlot, timeIndex) => (
                        <TableRow key={timeIndex}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {timeSlot}
                            </div>
                          </TableCell>
                          {plan.timetable.map((day) => {
                            const slot = day.slots.find(s => s.time === timeSlot);
                            return (
                              <TableCell key={day.day} className="text-center">
                                {slot ? (
                                  <div className="space-y-1">
                                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                      slot.type === "break"
                                        ? "bg-muted text-muted-foreground"
                                        : slot.type === "revision"
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "bg-violet-500/10 text-violet-400"
                                    }`}>
                                      {slot.type}
                                    </div>
                                    <div className="text-xs font-medium">{slot.subject}</div>
                                    {slot.topic && (
                                      <div className="text-xs text-muted-foreground">{slot.topic}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Goals & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.weeklyGoals?.length > 0 && (
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-foreground">Weekly Goals</h3>
                  </div>
                  <ul className="space-y-2">
                    {plan.weeklyGoals.map((g, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span> {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.tips?.length > 0 && (
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                    <h3 className="text-sm font-semibold text-foreground">Study Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {plan.tips.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">💡</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;
