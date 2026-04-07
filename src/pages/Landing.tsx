import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, Brain, FileText, Calendar, Users, Timer, HelpCircle, Layers, ArrowRight, Star, Zap, BookOpen, Target } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Landing = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      id: "ai-tutor",
      title: "AI Chat Tutor",
      description: "Get personalized learning assistance with step-by-step explanations",
      icon: Brain,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      stats: "24/7 Available"
    },
    {
      id: "notes",
      title: "Notes Simplifier",
      description: "Transform long notes into concise summaries and key concepts",
      icon: FileText,
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500/10",
      stats: "Smart Analysis"
    },
    {
      id: "quiz",
      title: "Quiz Generator",
      description: "Create interactive quizzes with instant scoring and feedback",
      icon: Target,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      stats: "Adaptive Learning"
    },
    {
      id: "flashcards",
      title: "Auto Flashcards",
      description: "Generate colorful flip cards for effective memorization",
      icon: Layers,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      stats: "Visual Learning"
    },
    {
      id: "planner",
      title: "Study Planner",
      description: "Create personalized timetables with smart scheduling",
      icon: Calendar,
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-500/10",
      stats: "Time Management"
    },
    {
      id: "doubt",
      title: "Doubt Solver",
      description: "Upload questions and get detailed solutions instantly",
      icon: HelpCircle,
      color: "from-sky-500 to-blue-600",
      bgColor: "bg-sky-500/10",
      stats: "Instant Help"
    },
    {
      id: "mocktest",
      title: "Mock Test",
      description: "Practice with timed exams and comprehensive analysis",
      icon: Timer,
      color: "from-red-500 to-orange-600",
      bgColor: "bg-red-500/10",
      stats: "Exam Ready"
    },
    {
      id: "group",
      title: "Group Study",
      description: "Collaborate with peers in real-time study rooms",
      icon: Users,
      color: "from-pink-500 to-purple-600",
      bgColor: "bg-pink-500/10",
      stats: "Team Learning"
    }
  ];

  const stats = [
    { label: "Active Students", value: "10K+", icon: Users },
    { label: "Questions Solved", value: "100K+", icon: Target },
    { label: "Study Hours", value: "50K+", icon: Timer },
    { label: "Success Rate", value: "95%", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">Learnova</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="hover:bg-primary/10 transition-colors"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="gradient-primary text-primary-foreground hover:scale-105 transition-transform"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Learnova</span>
            </h1>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Learn Smarter,</span>
              <br />
              <span className="text-muted-foreground">Not Harder</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your learning experience with AI-powered tools designed for modern students. 
              From personalized tutoring to smart study planning, everything you need to excel.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="gradient-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 text-lg border-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Features
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="glass-card rounded-xl p-6 text-center fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-2xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to 
              <span className="gradient-text"> Excel</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive learning tools designed to make studying effective and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`glass-card rounded-xl p-6 cursor-pointer card-hover fade-in-up ${feature.bgColor}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setIsHovered(feature.id)}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => navigate("/auth")}
              >
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {feature.stats}
                  </span>
                  {isHovered === feature.id && (
                    <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Join 10,000+ Students</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your 
              <span className="gradient-text"> Learning Journey?</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your free trial today and experience the future of education with AI-powered learning tools.
            </p>
            
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:scale-105 transition-all shadow-xl"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">Learnova</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Learnova. Empowering students with AI-powered learning.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
