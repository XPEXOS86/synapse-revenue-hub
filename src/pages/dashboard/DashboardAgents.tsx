import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, Pause, Play, CreditCard, Eye, Megaphone, Link2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const agents = [
  { name: "Billing Agent", role: "Gerencia planos, pay-per-use, upgrades e suspensões", brain: "All Brains", status: "running", uptime: "100%", events: 1840, icon: CreditCard, integrations: ["Stripe", "ClickBank", "Hotmart"] },
  { name: "Monitor Agent", role: "Monitora performance, alertas, falhas e logs", brain: "All Brains", status: "running", uptime: "99.9%", events: 3420, icon: Eye, integrations: [] },
  { name: "Marketing Agent", role: "Integração e automação de campanhas", brain: "All Brains", status: "running", uptime: "99.5%", events: 1560, icon: Megaphone, integrations: ["Meta Ads", "Google Ads", "LinkedIn Ads", "HubSpot"] },
  { name: "Integration Agent", role: "Conecta SaaS externos, Zapier e webhooks", brain: "All Brains", status: "running", uptime: "99.7%", events: 2100, icon: Link2, integrations: ["Zapier", "Webhook Listener"] },
  { name: "Brain Sync Agent", role: "Mantém Brains atualizados e replicáveis", brain: "Gayson Core", status: "running", uptime: "99.8%", events: 890, icon: RefreshCw, integrations: [] },
  { name: "Automation Agent", role: "Otimiza fluxo interno, cross-sell e upsell automático", brain: "Gayson Core", status: "paused", uptime: "98.2%", events: 0, icon: Sparkles, integrations: [] },
];

const DashboardAgents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">EdFunk Agents</h1>
        <p className="text-sm text-muted-foreground">Monitore e controle seus 6 agentes autônomos.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-card rounded-xl border border-border/50 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon className={`h-4 w-4 ${agent.status === "running" ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <Badge
                  variant={agent.status === "running" ? "default" : "outline"}
                  className="text-xs"
                >
                  {agent.status === "running" ? "Ativo" : "Pausado"}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{agent.role}</p>

              {agent.integrations.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.integrations.map((int) => (
                    <span key={int} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{int}</span>
                  ))}
                </div>
              )}

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
          );
        })}
      </div>
    </div>
  );
};

export default DashboardAgents;
