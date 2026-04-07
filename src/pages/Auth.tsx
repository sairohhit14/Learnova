import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock, User, ArrowRight } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Check if email is verified
        if (data.user && !data.user.email_confirmed_at) {
          toast.error("Please verify your email before logging in. Check your inbox.");
          await supabase.auth.signOut();
          return;
        }
        
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        // Validate username
        if (username.trim().length < 3) {
          toast.error("Username must be at least 3 characters long");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;
        toast.success("Account created! Please check your email to verify your account.");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message?.includes("User already registered")) {
        toast.error("This email is already registered. Try signing in instead.");
      } else if (error.message?.includes("Invalid login credentials")) {
        toast.error("Incorrect email or password. Please try again.");
      } else {
        toast.error(error.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary glow-primary">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text text-shadow">Learnova</h1>
          <p className="text-muted-foreground mt-2">Your AI-powered learning companion</p>
        </div>

        <div className="glass-card rounded-2xl p-8 scale-in">
          <div className="flex rounded-xl bg-secondary p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLogin ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isLogin ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative fade-in-up">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-secondary border-border input-enhanced"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="relative fade-in-up" style={{ animationDelay: isLogin ? '0ms' : '100ms' }}>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border input-enhanced"
                required
              />
            </div>
            <div className="relative fade-in-up" style={{ animationDelay: isLogin ? '100ms' : '200ms' }}>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-secondary border-border input-enhanced"
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-primary-foreground py-6 text-base font-semibold hover:scale-105 transition-transform fade-in-up"
              style={{ animationDelay: isLogin ? '200ms' : '300ms' }}
            >
              {loading ? (
                <>
                  <div className="loading-spin h-4 w-4 mr-2" />
                  Please wait...
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
