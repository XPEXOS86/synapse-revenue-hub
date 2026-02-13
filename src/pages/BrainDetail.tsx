import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Zap, Users, BarChart, Globe, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brains } from "@/data/brains";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const integrationIcons: Record<string, React.ElementType> = {
  Stripe: Globe,
  ClickBank: Globe,
  Zapier: Zap,
  HubSpot: Users,
  "Meta Ads": BarChart,
  "Google Ads": BarChart,
};

const BrainDetail = () => {
  const { brainId } = useParams();
  const brain = brains.find((b) => b.id === brainId);

  if (!brain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Brain não encontrado</h1>
          <Link to="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = brain.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container px-6 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao portfólio
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${brain.color} flex items-center justify-center mb-6`}>
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{brain.name}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {brain.description}
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="shadow-glow font-semibold">
                Começar agora
              </Button>
              <Button size="lg" variant="outline" className="font-semibold">
                Ver demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/30">
        <div className="container px-6">
          <h2 className="text-2xl font-bold mb-10">Funcionalidades</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
            {brain.features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-gradient-card border border-border/30"
              >
                <Check className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span className="text-sm text-secondary-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 border-t border-border/30">
        <div className="container px-6">
          <h2 className="text-2xl font-bold mb-10">Integrações</h2>
          <div className="flex flex-wrap gap-3">
            {brain.integrations.map((name) => {
              const IntIcon = integrationIcons[name] || LinkIcon;
              return (
                <div key={name} className="glass rounded-xl px-5 py-3 flex items-center gap-3">
                  <IntIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-border/30">
        <div className="container px-6">
          <h2 className="text-2xl font-bold mb-10">Planos</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            {brain.pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-xl border p-6 flex flex-col ${
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
                <div className="mb-5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  Escolher {plan.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrainDetail;
