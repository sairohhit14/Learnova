import { AlertTriangle } from "lucide-react";

interface RedFlagsSectionProps {
  redFlags: string[];
}

export const RedFlagsSection = ({ redFlags }: RedFlagsSectionProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-semibold text-foreground">Red Flags Detected</h3>
      </div>
      {redFlags.length === 0 ? (
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <p className="text-sm text-warning">
              No significant red flags identified in the provided information.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {redFlags.map((flag, index) => (
            <li key={index} className="rounded-lg bg-destructive/10 p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <p className="text-sm text-destructive">{flag}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
