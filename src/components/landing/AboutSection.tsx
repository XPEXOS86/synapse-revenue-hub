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
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">About Xpex Systems AI</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Xpex Systems AI builds scalable infrastructure tools focused on data validation, automation and performance-driven systems for modern businesses.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
