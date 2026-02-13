import { motion } from "framer-motion";
import { brains } from "@/data/brains";
import BrainCard from "./BrainCard";

const BrainGrid = () => {
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
            5 Brains. <span className="text-gradient-primary">Uma plataforma.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada Brain opera como um SaaS + API independente com dashboard, billing e agentes inteligentes.
            Escolha o que você precisa ou combine todos.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {brains.map((brain, i) => (
            <BrainCard key={brain.id} brain={brain} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrainGrid;
