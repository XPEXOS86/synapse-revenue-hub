import { motion } from "framer-motion";
import { Shield, Zap, Globe, CreditCard, Server } from "lucide-react";

const items = [
  { icon: Server, label: "99.9% Infrastructure Availability" },
  { icon: Zap, label: "Real-time Processing" },
  { icon: Shield, label: "Multi-tenant Secure Architecture" },
  { icon: CreditCard, label: "Stripe Verified Billing" },
  { icon: Globe, label: "Global Edge Deployment" },
];

const InfraStatus = () => {
  return (
    <section className="border-y border-border/30 py-6 bg-card/30">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-4"
        >
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-primary shrink-0" />
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InfraStatus;
