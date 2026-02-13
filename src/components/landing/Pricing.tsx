import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "R$497",
    period: "/mês",
    description: "Para validação de produto e primeiros clientes.",
    features: [
      "3 agentes ativos",
      "5.000 API calls/mês",
      "Dashboard básico",
      "Suporte por email",
      "1 integração",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "R$1.997",
    period: "/mês",
    description: "Para escalar rápido com automação completa.",
    features: [
      "Agentes ilimitados",
      "50.000 API calls/mês",
      "Dashboard avançado",
      "Suporte prioritário",
      "Todas as integrações",
      "Marketplace acesso",
      "Analytics completo",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$8.000+",
    period: "/mês",
    description: "Para operações de alto volume e custom.",
    features: [
      "Tudo do Growth",
      "API calls ilimitadas",
      "SLA dedicado",
      "Custom agents",
      "White-label",
      "Onboarding 1:1",
    ],
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 relative">
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
            Comece pequeno e escale conforme sua receita cresce.
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
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                Escolher plano
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
