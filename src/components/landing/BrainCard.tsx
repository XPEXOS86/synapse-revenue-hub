import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { BrainProduct } from "@/data/brains";

interface BrainCardProps {
  brain: BrainProduct;
  index: number;
}

const BrainCard = ({ brain, index }: BrainCardProps) => {
  const Icon = brain.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        to={`/brain/${brain.id}`}
        className="group block h-full bg-gradient-card rounded-xl border border-border/50 p-7 hover:border-primary/40 transition-all duration-300 hover:shadow-glow"
      >
        <div className={`h-11 w-11 rounded-lg bg-gradient-to-br ${brain.color} flex items-center justify-center mb-5 opacity-80 group-hover:opacity-100 transition-opacity`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>

        <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
          {brain.shortName}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {brain.tagline}
        </p>

        <div className="flex items-center gap-1.5 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalhes
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
};

export default BrainCard;
