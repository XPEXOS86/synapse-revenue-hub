import { motion } from "framer-motion";
import { Mail, Shield, Database, BarChart3, Zap, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Validação em tempo real",
    description: "Verifique emails instantaneamente via API REST. Score de confiança, detecção de MX/DNS e status deliverable.",
  },
  {
    icon: Shield,
    title: "Detecção de disposable",
    description: "Bloqueie emails temporários e descartáveis automaticamente. Base atualizada com 10.000+ domínios.",
  },
  {
    icon: Database,
    title: "Enriquecimento de dados",
    description: "Adicione informações de empresa, cargo e segmento aos seus leads automaticamente.",
  },
  {
    icon: BarChart3,
    title: "Relatórios inteligentes",
    description: "Dashboard com métricas de uso, taxa de validação, score médio e tendências semanais.",
  },
  {
    icon: Zap,
    title: "API robusta",
    description: "REST API com autenticação via API Key, rate limiting proporcional ao plano e documentação completa.",
  },
  {
    icon: CheckCircle,
    title: "Sandbox interativo",
    description: "Teste validações diretamente no playground antes de integrar. Sem setup, sem complicação.",
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

const BrainGrid = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Tudo que você precisa para{" "}
            <span className="text-gradient-primary">validar emails</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Validação inteligente, enriquecimento de dados, relatórios automáticos e API pronta para integrar.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feat) => (
            <motion.div
              key={feat.title}
              variants={item}
              className="group bg-gradient-card rounded-xl border border-border/50 p-6 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                <feat.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BrainGrid;
