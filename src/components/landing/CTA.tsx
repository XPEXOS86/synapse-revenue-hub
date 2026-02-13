import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
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
            <Mail className="h-12 w-12 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comece a validar emails <span className="text-gradient-primary">agora</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              API pronta, dashboard completo, relatórios automáticos. A partir de $19/mês.
            </p>
            <Link to="/auth">
              <Button size="lg" className="h-13 px-8 text-base font-semibold shadow-glow">
                Criar conta grátis
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
