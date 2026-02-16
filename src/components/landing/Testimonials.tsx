import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Lucas Ferreira",
    role: "Head of Growth",
    company: "ScaleUp Digital",
    avatar: "LF",
    quote: "Reduzimos nosso bounce rate em 73% no primeiro mês. A API é incrivelmente rápida e a integração levou menos de 1 hora.",
    rating: 5,
  },
  {
    name: "Mariana Costa",
    role: "CTO",
    company: "DataFlow Labs",
    avatar: "MC",
    quote: "A melhor ferramenta de validação que já usamos. O score de confiança nos ajuda a priorizar leads quentes e economizar em campanhas.",
    rating: 5,
  },
  {
    name: "Rafael Oliveira",
    role: "Email Marketing Manager",
    company: "E-comBR",
    avatar: "RO",
    quote: "Antes perdíamos milhares por mês com emails inválidos. Agora validamos tudo antes de enviar. ROI absurdo.",
    rating: 5,
  },
  {
    name: "Ana Paula Silva",
    role: "Product Lead",
    company: "Fintech One",
    avatar: "AS",
    quote: "O sandbox na landing page já me convenceu. Testei 5 emails e em 2 minutos já estava assinando o plano Pro.",
    rating: 5,
  },
  {
    name: "Diego Santos",
    role: "DevOps Engineer",
    company: "CloudStack",
    avatar: "DS",
    quote: "Documentação impecável, resposta em menos de 50ms e zero downtime em 6 meses. Exatamente o que precisávamos.",
    rating: 5,
  },
  {
    name: "Camila Rodrigues",
    role: "CMO",
    company: "GrowthBase",
    avatar: "CR",
    quote: "Integramos com nosso CRM via API em uma tarde. A detecção de disposable emails salvou nossas campanhas de cold outreach.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none opacity-50" />
      <div className="container px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Quem usa, <span className="text-gradient-primary">recomenda</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Empresas de todos os tamanhos confiam no Gold Mail Validator para proteger sua reputação e otimizar campanhas.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="relative rounded-xl border border-border/50 bg-gradient-card p-6 flex flex-col gap-4 group hover:border-primary/30 transition-colors"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />

              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
