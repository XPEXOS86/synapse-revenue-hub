import { motion } from "framer-motion";
import { Brain, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <div className="container relative z-10 px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-sm text-muted-foreground"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            Gayson Full Edition · 5 Brains · 6 EdFunk Agents · Multi-nicho
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-gradient-primary">Gayson</span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl text-muted-foreground font-medium">SaaS + API de última geração</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            5 Brains autônomos, 6 EdFunk Agents, billing engine, API gateway e marketplace —
            orquestrados pelo Gayson Core para escalar em qualquer nicho.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="h-13 px-8 text-base font-semibold shadow-glow">
                <Brain className="mr-2 h-5 w-5" />
                Acessar Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-13 px-8 text-base font-semibold group">
              <Zap className="mr-2 h-4 w-4" />
              Ver EdFunk Agents
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-3 sm:grid-cols-6 gap-6 max-w-4xl mx-auto mt-20"
        >
          {[
            { value: "5", label: "Brains" },
            { value: "6", label: "EdFunk Agents" },
            { value: "12+", label: "Integrações" },
            { value: "35+", label: "Features" },
            { value: "3", label: "Planos" },
            { value: "∞", label: "Nichos" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-gradient-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
