import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const agents = [
  { name: "Email Health Monitor", brain: "Email Validation", status: "running", uptime: "99.8%", events: 1240 },
  { name: "Lead Enrichment Agent", brain: "Data Enrichment", status: "running", uptime: "99.5%", events: 890 },
  { name: "Funnel Optimizer", brain: "Revenue Intelligence", status: "running", uptime: "98.9%", events: 620 },
  { name: "Budget Guardian", brain: "Ad Optimization", status: "paused", uptime: "97.2%", events: 0 },
  { name: "Campaign ROI Tracker", brain: "Ad Optimization", status: "running", uptime: "99.1%", events: 1100 },
  { name: "Workflow Dispatcher", brain: "Workflow Automation", status: "running", uptime: "99.7%", events: 780 },
  { name: "Billing Alert Agent", brain: "All Brains", status: "running", uptime: "100%", events: 340 },
];

const DashboardAgents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Agents</h1>
        <p className="text-sm text-muted-foreground">Monitore e controle seus agentes autônomos.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gradient-card rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <Activity className={`h-4 w-4 ${agent.status === "running" ? "text-emerald-400" : "text-muted-foreground"}`} />
              <Badge
                variant={agent.status === "running" ? "default" : "outline"}
                className="text-xs"
              >
                {agent.status === "running" ? "Ativo" : "Pausado"}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{agent.brain}</p>
            <div className="flex justify-between text-xs text-muted-foreground mb-3">
              <span>Uptime: {agent.uptime}</span>
              <span>{agent.events} eventos</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              {agent.status === "running" ? (
                <><Pause className="h-3 w-3 mr-1" /> Pausar</>
              ) : (
                <><Play className="h-3 w-3 mr-1" /> Iniciar</>
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAgents;
