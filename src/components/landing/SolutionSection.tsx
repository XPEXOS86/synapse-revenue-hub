import { motion } from "framer-motion";
import { Brain, Layers, ShieldCheck, Sparkles } from "lucide-react";

const pillars = [
  { icon: Brain, label: "Motor de validação proprietário" },
  { icon: Layers, label: "Score de confiança multi-camada" },
  { icon: ShieldCheck, label: "Detecção de descartáveis e role-based" },
  { icon: Sparkles, label: "Análise de reputação de domínio" },
];

const SolutionSection = () => {
  return (
    <section className="py-24 bg-card/20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              A solução
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Inteligência de email que <span className="text-gradient-primary">protege e otimiza</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
              O Gold Mail Validator vai além da sintaxe. Nosso motor proprietário cruza validação MX, handshake SMTP, análise de reputação e detecção de padrões de risco para entregar um score de confiança preciso em cada email.
            </p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-2 gap-4"
            >
              {pillars.map((p) => (
                <motion.div
                  key={p.label}
                  variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3"
                >
                  <p.icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{p.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-primary/15 bg-gradient-card p-8 space-y-5"
          >
            <p className="text-sm font-medium text-primary">Antes vs Depois</p>
            <div className="space-y-4">
              {[
                { label: "Bounce Rate", before: "14.2%", after: "3.8%", improvement: "-73%" },
                { label: "Sender Score", before: "62/100", after: "94/100", improvement: "+51%" },
                { label: "Deliverability", before: "78%", after: "97%", improvement: "+24%" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-background/50 border border-border/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{m.label}</span>
                    <span className="text-xs font-bold text-primary">{m.improvement}</span>
                  </div>
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    <span>Antes: <span className="text-destructive font-medium">{m.before}</span></span>
                    <span>Depois: <span className="text-primary font-medium">{m.after}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
