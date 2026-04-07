import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, MessageCircle, FileText, Brain, Layers,
  LogOut, Trophy, Star, Zap, CalendarDays, HelpCircle, Timer, Users
} from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

const features = [
  {
    title: "AI Chat Tutor",
    description: "Ask any question and get step-by-step explanations",
    icon: MessageCircle,
    path: "/chat",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-400",
    delay: "animation-delay-0",
  },
  {
    title: "Notes Simplifier",
    description: "Paste long notes → get summaries & key concepts",
    icon: FileText,
    path: "/notes",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    delay: "animation-delay-100",
  },
  {
    title: "Quiz Generator",
    description: "Enter a topic → get MCQs with instant scoring",
    icon: Brain,
    path: "/quiz",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    delay: "animation-delay-200",
  },
  {
    title: "Auto Flashcards",
    description: "Colorful flip cards with Q&A pairs",
    icon: Layers,
    path: "/flashcards",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-400",
    delay: "animation-delay-300",
  },
  {
    title: "Study Planner",
    description: "Generate a weekly timetable & study plan",
    icon: CalendarDays,
    path: "/planner",
    bgColor: "bg-rose-500/10",
    iconColor: "text-rose-400",
    delay: "animation-delay-0",
  },
  {
    title: "Doubt Solver",
    description: "Upload a question image or type it — get full solution",
    icon: HelpCircle,
    path: "/doubt",
    bgColor: "bg-sky-500/10",
    iconColor: "text-sky-400",
    delay: "animation-delay-100",
  },
  {
    title: "Mock Test",
    description: "Timed exams with auto-submit & score analysis",
    icon: Timer,
    path: "/mocktest",
    bgColor: "bg-red-500/10",
    iconColor: "text-red-400",
    delay: "animation-delay-200",
  },
  {
    title: "Group Study",
    description: "Create or join rooms — chat & discuss doubts",
    icon: Users,
    path: "/group",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-400",
    delay: "animation-delay-300",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { count } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setQuizCount(count || 0);
    };
    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary glow-primary">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text text-shadow">Learnova</h1>
              <p className="text-sm text-muted-foreground">Learn smarter, not harder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.username || "Student"}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:scale-110 transition-transform focus-ring">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass-card rounded-xl p-4 text-center card-hover scale-in">
            <Trophy className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{profile?.points || 0}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center card-hover scale-in animation-delay-100">
            <Star className="h-5 w-5 text-violet-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">Lvl {profile?.level || 1}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center card-hover scale-in animation-delay-200">
            <Zap className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{quizCount}</p>
            <p className="text-xs text-muted-foreground">Quizzes</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 fade-in-up">Start Learning</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <button
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className={`glass-card card-hover rounded-2xl p-6 text-left group fade-in-up focus-ring ${feature.delay}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:gradient-text transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
