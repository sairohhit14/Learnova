import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/hooks/use-theme";
import Auth from "./pages/Auth";
import EmailVerification from "./pages/EmailVerification";
import Dashboard from "./pages/Dashboard";
import ChatTutor from "./pages/ChatTutor";
import NotesSimplifier from "./pages/NotesSimplifier";
import QuizGenerator from "./pages/QuizGenerator";
import Flashcards from "./pages/Flashcards";
import StudyPlanner from "./pages/StudyPlanner";
import DoubtSolver from "./pages/DoubtSolver";
import MockTest from "./pages/MockTest";
import GroupStudy from "./pages/GroupStudy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  return authenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify" element={<EmailVerification />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatTutor /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotesSimplifier /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
            <Route path="/doubt" element={<ProtectedRoute><DoubtSolver /></ProtectedRoute>} />
            <Route path="/mocktest" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
            <Route path="/group" element={<ProtectedRoute><GroupStudy /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
