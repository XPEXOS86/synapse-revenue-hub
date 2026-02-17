import { motion } from "framer-motion";
import { Shield, Zap, BarChart3, Link2, MailCheck } from "lucide-react";

const modules = [
  {
    icon: MailCheck,
    name: "XPEX Validate",
    description: "Email, phone and data validation for revenue protection.",
    credits: "1 credit/call",
  },
  {
    icon: Shield,
    name: "XPEX Shield",
    description: "Fraud detection and behavioral risk scoring.",
    credits: "5 credits/call",
  },
  {
    icon: Zap,
    name: "XPEX Automate",
    description: "Event-driven intelligent workflows.",
    credits: "3 credits/exec",
  },
  {
    icon: BarChart3,
    name: "XPEX Insight",
    description: "Predictive analytics and business intelligence.",
    credits: "10 credits/analysis",
  },
  {
    icon: Link2,
    name: "XPEX Connect",
    description: "Universal integration layer and API bridges.",
    credits: "2 credits/request",
  },
];

const ModulesSection = () => {
  return (
    <section id="modules" className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Five Modules. One Platform.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Each module is purpose-built for a specific operational need, all unified under a single API and credit system.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="rounded-xl border border-border/50 bg-gradient-card p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <mod.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{mod.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{mod.description}</p>
              <span className="text-xs font-medium text-primary/80">{mod.credits}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ModulesSection;
