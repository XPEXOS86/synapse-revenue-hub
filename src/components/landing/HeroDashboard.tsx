import { CheckCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const checks = [
  { label: "Syntax Valid", ok: true },
  { label: "MX Record Active", ok: true },
  { label: "SMTP Verified", ok: true },
  { label: "Not Disposable", ok: true },
  { label: "Not Role-Based", ok: true },
  { label: "No Catch-All Detected", ok: true },
];

const HeroDashboard = () => {
  const score = 94;

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">contact@enterprise.io</span>
        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs">
          <ShieldCheck className="w-3 h-3" /> VALID
        </Badge>
      </div>

      {/* Score */}
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
            <circle
              cx="30" cy="30" r="24" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 150.8} 150.8`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{score}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">Confidence: <span className="text-primary">High</span></div>
          <div className="text-sm font-medium">Risk: <span className="text-[hsl(var(--success))]">Low</span></div>
        </div>
      </div>

      {/* Checks */}
      <div className="grid grid-cols-2 gap-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroDashboard;
