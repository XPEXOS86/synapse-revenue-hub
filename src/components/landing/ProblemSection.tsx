import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Clock, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: DollarSign,
    title: "Desperdício em campanhas",
    desc: "Emails inválidos queimam orçamento de marketing e reduzem ROI de campanhas de aquisição.",
  },
  {
    icon: TrendingDown,
    title: "Reputação de remetente destruída",
    desc: "Altas taxas de bounce prejudicam seu domínio nos provedores, fazendo emails legítimos caírem no spam.",
  },
  {
    icon: Clock,
    title: "Processos manuais e lentos",
    desc: "Verificar listas manualmente consome horas da equipe e ainda deixa emails ruins passarem.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-4 py-1.5 text-xs font-medium mb-5">
            <AlertTriangle className="w-3.5 h-3.5" />
            O problema que custa caro
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Emails inválidos estão sabotando seus resultados
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Empresas perdem em média 12% do orçamento de email marketing por enviar para endereços inválidos, descartáveis ou de alto risco.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid md:grid-cols-3 gap-6"
        >
          {problems.map((p) => (
            <motion.div
              key={p.title}
              variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="rounded-xl border border-destructive/10 bg-gradient-card p-7"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
