import { CheckCircle, ExternalLink } from "lucide-react";

interface Source {
  name: string;
  url: string;
}

interface CrossReferenceSourcesProps {
  sources: Source[];
}

export const CrossReferenceSources = ({ sources }: CrossReferenceSourcesProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Cross-Referenced Sources</h3>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-foreground">{source.name}</span>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
};
