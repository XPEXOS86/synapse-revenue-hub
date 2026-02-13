import { motion } from "framer-motion";
import { Zap, Users, BarChart, Globe, Link } from "lucide-react";

const integrations = [
  { name: "Stripe", icon: CreditCardIcon },
  { name: "ClickBank", icon: Globe },
  { name: "Zapier", icon: Zap },
  { name: "HubSpot", icon: Users },
  { name: "Meta Ads", icon: BarChart },
  { name: "Google Ads", icon: BarChart },
  { name: "Webhooks", icon: Link },
  { name: "OAuth", icon: Users },
];

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

const Integrations = () => {
  return (
    <section className="py-24 relative border-t border-border/30">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Conecte com <span className="text-gradient-primary">tudo</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            9+ integrações prontas para billing, CRM, ads e automação.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {integrations.map((int, i) => (
            <motion.div
              key={int.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl px-5 py-3 flex items-center gap-3 hover:border-primary/30 transition-colors"
            >
              <int.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{int.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
