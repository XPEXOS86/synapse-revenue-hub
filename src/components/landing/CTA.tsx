import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center rounded-2xl border border-primary/15 p-14 overflow-hidden bg-gradient-card"
        >
          <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Proteja sua reputação de remetente <span className="text-gradient-primary">hoje</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Comece a validar em minutos. Sem cartão de crédito. Sem compromisso.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 font-semibold shadow-glow gap-2">
                  Criar conta agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/enterprise">
                <Button size="lg" variant="outline" className="h-12 px-8 font-semibold">
                  Falar com Enterprise Sales
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3" />
              Leva menos de 2 minutos para começar
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
