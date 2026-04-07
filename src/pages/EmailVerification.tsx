import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        toast.error("Invalid verification link");
        navigate("/auth");
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.verifyOtp({ 
          token,
          type: 'signup'
        });
        if (error) throw error;
        
        setVerified(true);
        toast.success("Email verified successfully! You can now log in.");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      } catch (error: any) {
        console.error("Verification error:", error);
        toast.error(error.message || "Email verification failed");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="loading-spin h-8 w-8 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-6">Your account has been successfully verified.</p>
          <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <Mail className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
        <p className="text-muted-foreground mb-6">The verification link is invalid or has expired.</p>
        <Button onClick={() => navigate("/auth")} className="gradient-primary">
          Back to Login
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EmailVerification;
