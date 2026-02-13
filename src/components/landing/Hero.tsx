import { motion } from "framer-motion";
import { ArrowRight, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HeroDashboard from "./HeroDashboard";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
              Powered by Xpex Systems AI Infrastructure
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] mb-5">
              Enterprise Email Intelligence Infrastructure
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Advanced email validation, scoring and risk analysis platform built for scale, security and performance.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-7 font-semibold shadow-glow gap-2">
                  Start Free Validation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline" className="h-12 px-7 font-semibold gap-2">
                  <FileText className="h-4 w-4" />
                  View API Documentation
                </Button>
              </Link>
              <Link to="/enterprise">
                <Button size="lg" variant="ghost" className="h-12 px-7 font-semibold gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Talk to Enterprise Sales
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right - Live Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HeroDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
