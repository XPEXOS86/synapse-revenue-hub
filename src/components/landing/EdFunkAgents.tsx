import { motion } from "framer-motion";
import { CreditCard, Eye, Link2, Key, Bell, BarChart3 } from "lucide-react";

const agents = [
  {
    name: "Billing Agent",
    role: "Gerencia planos, upgrades, suspensões e pagamentos via Stripe",
    icon: CreditCard,
  },
  {
    name: "Monitor Agent",
    role: "Monitora performance da API, alertas de falhas e logs em tempo real",
    icon: Eye,
  },
  {
    name: "Integration Agent",
    role: "Conecta com Zapier, HubSpot, CRM e webhooks customizados",
    icon: Link2,
  },
  {
    name: "API Key Manager",
    role: "Gera, valida e rotaciona API keys com hashing SHA-256",
    icon: Key,
  },
  {
    name: "Notification Agent",
    role: "Envia alertas de uso, limites atingidos e relatórios automáticos",
    icon: Bell,
  },
  {
    name: "Usage Logger Agent",
    role: "Registra todas as chamadas, response times e status codes",
    icon: BarChart3,
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
            <span className="text-gradient-accent">6 Agents</span> autônomos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Agentes inteligentes que operam 24/7 — billing, monitoramento, integrações, API keys, notificações e logging.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {agents.map((agent) => (
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
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EdFunkAgents;
