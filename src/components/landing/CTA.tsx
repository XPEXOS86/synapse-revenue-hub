import { motion } from "framer-motion";
import { Brain, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 relative">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center rounded-2xl border border-primary/20 p-12 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="h-10 w-10 text-primary animate-float" />
              <Zap className="h-8 w-8 text-accent animate-float" style={{ animationDelay: "1s" }} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pronto para o <span className="text-gradient-primary">XPEX AI</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              5 Brains de IA, 6 Agents autônomos, billing integrado e API gateway — infraestrutura SaaS B2B pronta para escalar.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="h-13 px-8 text-base font-semibold shadow-glow">
                Acessar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
