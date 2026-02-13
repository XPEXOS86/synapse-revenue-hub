import { motion } from "framer-motion";
import { CreditCard, Eye, Megaphone, Link2, RefreshCw, Sparkles } from "lucide-react";

const edFunkAgents = [
  {
    name: "Billing Agent",
    role: "Gerencia planos, pay-per-use, upgrades e suspensões",
    integrations: ["Stripe", "ClickBank", "Hotmart"],
    icon: CreditCard,
    status: "active",
  },
  {
    name: "Monitor Agent",
    role: "Monitora performance, alertas, falhas e logs em tempo real",
    integrations: [],
    icon: Eye,
    status: "active",
  },
  {
    name: "Marketing Agent",
    role: "Integração e automação de campanhas de ads",
    integrations: ["Meta Ads", "Google Ads", "LinkedIn Ads", "HubSpot"],
    icon: Megaphone,
    status: "active",
  },
  {
    name: "Integration Agent",
    role: "Conecta SaaS externos, Zapier e webhooks",
    integrations: ["Zapier", "Webhook Listener", "CRM APIs"],
    icon: Link2,
    status: "active",
  },
  {
    name: "Brain Sync Agent",
    role: "Mantém Brains atualizados e replicáveis entre tenants",
    integrations: [],
    icon: RefreshCw,
    status: "active",
  },
  {
    name: "Automation Agent",
    role: "Otimiza fluxo interno, cross-sell e upsell automático",
    integrations: [],
    icon: Sparkles,
    status: "active",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EdFunkAgents = () => {
  return (
    <section className="py-24 relative border-t border-border/30">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-gradient-accent">EdFunk</span> Agents
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            6 agentes autônomos que operam 24/7 — billing, monitoramento, marketing, integrações, sincronização e automação.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {edFunkAgents.map((agent) => (
            <motion.div
              key={agent.name}
              variants={item}
              className="group bg-gradient-card rounded-xl border border-border/50 p-6 hover:border-accent/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:shadow-[0_0_20px_-5px_hsl(270,80%,65%,0.3)] transition-shadow">
                  <agent.icon className="h-5 w-5 text-accent" />
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
                  Ativo
                </span>
              </div>
              <h3 className="font-semibold text-base mb-2">{agent.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{agent.role}</p>
              {agent.integrations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {agent.integrations.map((int) => (
                    <span key={int} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {int}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EdFunkAgents;
