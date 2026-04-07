import { Shield, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onHistoryClick: () => void;
}

export const Header = ({ onHistoryClick }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">TruthGuard</h1>
          <p className="text-sm text-muted-foreground">AI Misinformation Detector</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        className="text-muted-foreground hover:text-foreground"
        onClick={onHistoryClick}
      >
        <History className="mr-2 h-4 w-4" />
        History
      </Button>
    </header>
  );
};
