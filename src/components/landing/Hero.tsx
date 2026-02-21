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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
              Powered by XPEX SYSTEMS AI
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] mb-5">
              GoldMail AI — <span className="text-gradient-primary">Autonomous Email Intelligence</span> Agent
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-lg">
              Enterprise-grade email validation and deliverability analysis powered by artificial intelligence. Integrate in minutes, deploy with confidence.
            </p>

            <ul className="space-y-2 mb-8">
              {[
                "Real-time email validation & verification",
                "99.9% uptime with enterprise SLA",
                "REST API with webhooks & batch processing",
              ].map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link to="/sandbox">
                <Button size="lg" className="h-12 px-7 font-semibold shadow-glow gap-2">
                  Try Sandbox
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/api">
                <Button size="lg" variant="outline" className="h-12 px-7 font-semibold gap-2">
                  <FileText className="h-4 w-4" />
                  API Docs
                </Button>
              </Link>
              <Link to="/enterprise">
                <Button size="lg" variant="ghost" className="h-12 px-7 font-semibold gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Enterprise
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-3">No credit card required · Setup in 2 minutes</p>
          </motion.div>

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
