import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Pause, Play, Loader2, CreditCard, Eye, Megaphone, Link2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ElementType> = {
  "Billing Agent": CreditCard,
  "Monitor Agent": Eye,
  "Marketing Agent": Megaphone,
  "Integration Agent": Link2,
  "Brain Sync Agent": RefreshCw,
  "Automation Agent": Sparkles,
};

interface Agent {
  id: string;
  name: string;
  role: string;
  brain: string;
  status: string;
  events_count: number;
  last_heartbeat: string | null;
  config: Record<string, unknown> | null;
}

const DashboardAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("agents")
        .select("id, name, role, brain, status, events_count, last_heartbeat, config")
        .order("created_at", { ascending: true });

      if (data) setAgents(data as Agent[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleAgent = async (agent: Agent) => {
    const newStatus = agent.status === "running" ? "paused" : "running";
    await supabase.from("agents").update({ status: newStatus }).eq("id", agent.id);
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, status: newStatus } : a)));
  };

  const timeAgo = (d: string | null) => {
    if (!d) return "—";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">EdFunk Agents</h1>
        <p className="text-sm text-muted-foreground">
          {agents.length === 0
            ? "Nenhum agente configurado ainda. Agentes serão criados automaticamente com seu tenant."
            : `Monitore e controle seus ${agents.length} agentes autônomos.`}
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhum agente encontrado.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => {
            const Icon = iconMap[agent.name] || Sparkles;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-card rounded-xl border border-border/50 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className={`h-4 w-4 ${agent.status === "running" ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <Badge variant={agent.status === "running" ? "default" : "outline"} className="text-xs">
                    {agent.status === "running" ? "Ativo" : "Pausado"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{agent.role}</p>

                <div className="flex justify-between text-xs text-muted-foreground mb-3">
                  <span>Heartbeat: {timeAgo(agent.last_heartbeat)}</span>
                  <span>{agent.events_count} eventos</span>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toggleAgent(agent)}>
                  {agent.status === "running" ? (
                    <><Pause className="h-3 w-3 mr-1" /> Pausar</>
                  ) : (
                    <><Play className="h-3 w-3 mr-1" /> Iniciar</>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardAgents;
