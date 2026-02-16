import { motion } from "framer-motion";
import { Upload, Cpu, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Envie seus emails",
    desc: "Via API, upload de CSV ou integração direta. Suporte a listas de até 50.000 emails por job.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Processamento inteligente",
    desc: "Nosso motor valida sintaxe, MX, SMTP, detecta descartáveis e calcula score de confiança automaticamente.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Resultados segmentados",
    desc: "Receba relatórios com categorização: válidos, inválidos, catch-all, arriscados. Exporte ou integre via webhook.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Como funciona — em 3 passos
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Da integração ao resultado, em menos de 2 minutos.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="relative rounded-xl border border-border/50 bg-gradient-card p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-3xl font-extrabold text-primary/15">{s.step}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/auth">
            <Button size="lg" className="h-12 px-8 font-semibold shadow-glow gap-2">
              Começar agora — é grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
