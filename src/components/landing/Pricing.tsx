import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    credits: "15,000 credits included",
    overage: "$5 / 1,000 extra credits",
    features: [
      { label: "Access to Validate", included: true },
      { label: "Basic API Access", included: true },
      { label: "Email Support", included: true },
      { label: "Webhook Access", included: false },
      { label: "Advanced Analytics", included: false },
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "/mo",
    credits: "75,000 credits included",
    overage: "$4 / 1,000 extra credits",
    features: [
      { label: "Validate + Automate", included: true },
      { label: "Priority API Access", included: true },
      { label: "Webhook Access", included: true },
      { label: "Priority Support", included: true },
      { label: "Advanced Analytics", included: false },
    ],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$399",
    period: "/mo",
    credits: "250,000 credits included",
    overage: "$3 / 1,000 extra credits",
    features: [
      { label: "All Modules Access", included: true },
      { label: "Advanced Analytics", included: true },
      { label: "Dedicated Rate Limits", included: true },
      { label: "Priority SLA", included: true },
      { label: "Custom Integrations", included: true },
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
            Start with what you need and scale as your operations grow. All plans include credit-based usage.
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
              <p className="text-xs text-muted-foreground mb-1">{plan.credits}</p>
              <p className="text-xs text-muted-foreground/60 mb-5">{plan.overage}</p>
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
              <Link to="/auth">
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  Get {plan.name}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 max-w-4xl mx-auto rounded-xl border border-border/50 bg-gradient-card p-7 text-center"
        >
          <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Dedicated infrastructure, custom SLA, multi-region deployment, and an account manager.
          </p>
          <Link to="/enterprise">
            <Button variant="outline">Contact Sales</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
