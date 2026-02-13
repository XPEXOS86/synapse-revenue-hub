import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Pause, Play, Loader2, CreditCard, Eye, Megaphone, Link2, RefreshCw, Sparkles, Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ElementType> = {
  "Billing Agent": CreditCard,
  "Monitor Agent": Eye,
  "Marketing Agent": Megaphone,
  "Integration Agent": Link2,
  "Brain Sync Agent": RefreshCw,
  "Automation Agent": Sparkles
};

interface AgentWithHealth {
  id: string;
  name: string;
  role: string;
  brain: string;
  status: string;
  events_count: number;
  last_heartbeat: string | null;
  health: string;
  last_heartbeat_ago_ms: number;
}

const healthConfig: Record<string, {label: string;color: string;variant: "default" | "outline" | "secondary" | "destructive";}> = {
  healthy: { label: "Saudável", color: "text-green-400", variant: "default" },
  warning: { label: "Lento", color: "text-yellow-400", variant: "secondary" },
  critical: { label: "Crítico", color: "text-red-400", variant: "destructive" },
  paused: { label: "Pausado", color: "text-muted-foreground", variant: "outline" },
  never_seen: { label: "Sem dados", color: "text-muted-foreground", variant: "outline" },
  unknown: { label: "Desconhecido", color: "text-muted-foreground", variant: "outline" }
};

const DashboardAgents = () => {
  const [agents, setAgents] = useState<AgentWithHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulsing, setPulsing] = useState(false);

  const fetchStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await supabase.functions.invoke("agent-heartbeat", {
      body: { action: "status" }
    });

    if (res.data?.agents) {
      setAgents(res.data.agents);
    }
    setLoading(false);
  }, []);

  const sendPulse = async () => {
    setPulsing(true);
    await supabase.functions.invoke("agent-heartbeat", {
      body: { action: "pulse" }
    });
    await fetchStatus();
    setPulsing(false);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const toggleAgent = async (agent: AgentWithHealth) => {
    const newStatus = agent.status === "running" ? "paused" : "running";
    await supabase.from("agents").update({ status: newStatus }).eq("id", agent.id);
    await fetchStatus();
  };

  const timeAgo = (ms: number) => {
    if (!ms || ms < 0) return "—";
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>);

  }

  const healthyCt = agents.filter((a) => a.health === "healthy").length;
  const warningCt = agents.filter((a) => a.health === "warning" || a.health === "critical").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Agents </h1>
          <p className="text-sm text-muted-foreground">
            {agents.length === 0 ?
            "Nenhum agente configurado. Crie um tenant para provisionar automaticamente." :
            `${agents.length} agentes · ${healthyCt} saudáveis${warningCt > 0 ? ` · ${warningCt} com alertas` : ""}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={sendPulse} disabled={pulsing}>
          <Heart className={`h-4 w-4 mr-1 ${pulsing ? "animate-pulse text-red-400" : ""}`} />
          {pulsing ? "Enviando..." : "Enviar Pulse"}
        </Button>
      </div>

      {agents.length === 0 ?
      <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhum agente encontrado.
        </div> :

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => {
          const Icon = iconMap[agent.name] || Sparkles;
          const hc = healthConfig[agent.health] || healthConfig.unknown;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-card rounded-xl border border-border/50 p-5">

                <div className="flex items-center justify-between mb-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className={`h-4 w-4 ${agent.health === "healthy" ? "text-accent" : hc.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {(agent.health === "warning" || agent.health === "critical") &&
                  <AlertTriangle className={`h-3.5 w-3.5 ${hc.color}`} />
                  }
                    <Badge variant={hc.variant} className="text-xs">
                      {hc.label}
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{agent.role}</p>

                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span className="flex items-center gap-1">
                    <Heart className={`h-3 w-3 ${agent.health === "healthy" ? "text-green-400" : hc.color}`} />
                    {timeAgo(agent.last_heartbeat_ago_ms)}
                  </span>
                  <span>{agent.events_count ?? 0} eventos</span>
                </div>

                {/* Health bar */}
                <div className="h-1 rounded-full bg-muted mb-3 overflow-hidden">
                  <div
                  className={`h-full rounded-full transition-all duration-500 ${
                  agent.health === "healthy" ? "bg-green-400 w-full" :
                  agent.health === "warning" ? "bg-yellow-400 w-2/3" :
                  agent.health === "critical" ? "bg-red-400 w-1/3" :
                  "bg-muted-foreground w-0"}`
                  } />

                </div>

                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toggleAgent(agent)}>
                  {agent.status === "running" ?
                <><Pause className="h-3 w-3 mr-1" /> Pausar</> :

                <><Play className="h-3 w-3 mr-1" /> Iniciar</>
                }
                </Button>
              </motion.div>);

        })}
        </div>
      }
    </div>);

};

export default DashboardAgents;