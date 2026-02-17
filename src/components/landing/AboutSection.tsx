import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="company" className="py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">About XPEX Systems AI</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            XPEX Systems AI builds modular, AI-powered operational infrastructure for revenue-driven companies worldwide. From validation to fraud detection, we provide the building blocks for modern business operations.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
