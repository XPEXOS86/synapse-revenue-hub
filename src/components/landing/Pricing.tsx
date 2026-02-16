import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    credits: "10,000 validations",
    features: [
      { label: "API access", included: true },
      { label: "Dashboard analytics", included: true },
      { label: "Email support", included: true },
      { label: "Bulk support", included: false },
      { label: "Enterprise SLA", included: false },
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/mo",
    credits: "100,000 validations",
    features: [
      { label: "API access", included: true },
      { label: "Dashboard analytics", included: true },
      { label: "Priority support", included: true },
      { label: "Bulk support", included: true },
      { label: "Enterprise SLA", included: false },
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    credits: "Unlimited validations",
    features: [
      { label: "API access", included: true },
      { label: "Dashboard analytics", included: true },
      { label: "Dedicated support", included: true },
      { label: "Bulk support", included: true },
      { label: "Enterprise SLA", included: true },
    ],
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-card/20">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Flexible Plans for Every Stage</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free and scale as your validation needs grow.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className={`relative rounded-xl border p-7 flex flex-col ${
                plan.highlighted
                  ? "border-primary/40 shadow-glow bg-gradient-card"
                  : "border-border/50 bg-gradient-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-5">{plan.credits}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={f.included ? "text-muted-foreground" : "text-muted-foreground/40"}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to={plan.name === "Enterprise" ? "/enterprise" : "/auth"}>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  {plan.name === "Enterprise" ? "Contact Sales" : `Get ${plan.name}`}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
