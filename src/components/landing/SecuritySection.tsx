import { motion } from "framer-motion";
import { Lock, Users, Gauge, ShieldCheck, Activity, Eye } from "lucide-react";

const items = [
  { icon: Lock, title: "Multi-tenant isolation", desc: "Complete data separation between organizations." },
  { icon: Users, title: "Role-based access control", desc: "Granular permissions for teams and individuals." },
  { icon: Gauge, title: "Rate limiting enforcement", desc: "Protection against abuse and traffic spikes." },
  { icon: ShieldCheck, title: "Encrypted data in transit and at rest", desc: "End-to-end encryption for all data." },
  { icon: Activity, title: "Monitoring and anomaly detection", desc: "Real-time alerts on suspicious activity." },
  { icon: Eye, title: "Audit logging", desc: "Complete visibility into all system operations." },
];

const SecuritySection = () => {
  return (
    <section id="security" className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Security and Compliance</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enterprise-grade security practices embedded into every layer of the platform.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              className="rounded-xl border border-border/50 bg-gradient-card p-6"
            >
              <item.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;
