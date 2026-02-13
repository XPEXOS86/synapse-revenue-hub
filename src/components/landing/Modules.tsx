import { motion } from "framer-motion";
import { Bot, BarChart3, CreditCard, Globe, ShoppingBag, Shield } from "lucide-react";

const modules = [
  {
    icon: Shield,
    title: "Core Infrastructure",
    description: "Auth RBAC, API keys, rate limiting inteligente e logging centralizado.",
  },
  {
    icon: Bot,
    title: "Agent Runtime",
    description: "Agentes autônomos de monitoramento, billing, marketing e integração.",
  },
  {
    icon: BarChart3,
    title: "SaaS Dashboard",
    description: "Portal multinicho com painel de consumo, billing e demo interativa.",
  },
  {
    icon: Globe,
    title: "API Gateway",
    description: "REST + GraphQL com documentação auto-gerada e webhook listeners.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Publique, venda e assine agentes com analytics e payment gateway.",
  },
  {
    icon: CreditCard,
    title: "Billing Engine",
    description: "Stripe + ClickBank integrados com MRR tracking e afiliados.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Modules = () => {
  return (
    <section className="py-24 relative">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Arquitetura <span className="text-gradient-primary">modular</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cada módulo opera de forma independente. Ative apenas o que você precisa.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.title}
              variants={item}
              className="group bg-gradient-card rounded-xl border border-border/50 p-6 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                <mod.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{mod.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Modules;
