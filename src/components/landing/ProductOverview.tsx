import { motion } from "framer-motion";
import { Search, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Deep Validation Engine",
    items: ["Syntax verification", "MX record detection", "SMTP handshake", "Catch-all detection"],
  },
  {
    icon: Shield,
    title: "Risk Intelligence Layer",
    items: ["Disposable email detection", "Role-based detection", "Domain reputation signals", "Risk probability scoring"],
  },
  {
    icon: Zap,
    title: "Enterprise Performance",
    items: ["Bulk processing", "Async validation", "Webhook callbacks", "API-first architecture"],
  },
];

const ProductOverview = () => {
  return (
    <section id="product" className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Advanced Email Intelligence Engine</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our validation engine goes beyond syntax checks. We analyze domain configuration, SMTP handshake, reputation signals and risk indicators to deliver a confidence-based scoring system.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="rounded-xl border border-border/50 bg-gradient-card p-7"
            >
              <f.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-4">{f.title}</h3>
              <ul className="space-y-2.5">
                {f.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductOverview;
