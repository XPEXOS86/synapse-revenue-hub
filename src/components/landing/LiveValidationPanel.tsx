import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const checks = [
  { label: "Syntax Valid", ok: true },
  { label: "MX Record Active", ok: true },
  { label: "SMTP Verified", ok: true },
  { label: "Not Disposable", ok: true },
  { label: "Not Role-Based", ok: true },
  { label: "No Catch-All Detected", ok: true },
];

const scoreDistribution = [
  { range: "90-100", pct: 68 },
  { range: "70-89", pct: 18 },
  { range: "50-69", pct: 9 },
  { range: "0-49", pct: 5 },
];

const LiveValidationPanel = () => {
  return (
    <section className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Real-Time Email Intelligence Panel</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See how our engine analyzes and scores every email in real time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden"
        >
          {/* Top bar */}
          <div className="border-b border-border/30 px-6 py-3 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--warning))]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]" />
            <span className="text-xs text-muted-foreground ml-3 font-mono">validation-panel</span>
          </div>

          <div className="grid md:grid-cols-[1fr_280px] divide-x divide-border/30">
            {/* Main result */}
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                  <p className="font-mono text-sm">contact@enterprise.io</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">Score: 92/100</Badge>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Confidence Level</p>
                  <p className="text-sm font-medium text-primary">High</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk</p>
                  <p className="text-sm font-medium text-[hsl(var(--success))]">Low</p>
                </div>
              </div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                className="grid grid-cols-2 gap-3"
              >
                {checks.map((c) => (
                  <motion.div key={c.label} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } } }} className="flex items-center gap-2 text-sm">
                    {c.ok ? (
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span className="text-muted-foreground">{c.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Score Distribution sidebar */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Score Distribution</p>
              {scoreDistribution.map((s) => (
                <div key={s.range} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{s.range}</span>
                    <span>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveValidationPanel;
