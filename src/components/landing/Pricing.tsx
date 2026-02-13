import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/mês",
    limit: "100 validações/mês",
    description: "Para começar a validar e testar integrações.",
    features: [
      "100 validações/mês",
      "Validação básica de emails",
      "Relatórios semanais",
      "API Key para integração",
      "Dashboard simplificado",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mês",
    limit: "1.000 validações/mês",
    description: "Para times que precisam de volume e insights.",
    features: [
      "1.000 validações/mês",
      "Validação avançada de emails",
      "Enriquecimento de dados",
      "Relatórios detalhados",
      "API Key completa",
      "Dashboard completo",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mês",
    limit: "10.000 validações/mês",
    description: "Para operações de alto volume e custom.",
    features: [
      "10.000 validações/mês",
      "Validação premium de emails",
      "Enriquecimento e deduplicação avançada",
      "Integração completa com CRM",
      "API Key ilimitada",
      "Dashboard customizável",
      "Suporte dedicado 24/7",
      "Onboarding e treinamento",
    ],
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pricing <span className="text-gradient-accent">transparente</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Comece com $19/mês e escale conforme sua necessidade.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-xl border p-7 flex flex-col ${
                plan.highlighted
                  ? "border-primary/50 shadow-glow bg-gradient-card"
                  : "border-border/50 bg-gradient-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                  Mais popular
                </div>
              )}
              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Escolher {plan.name}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
