import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for testing and small projects",
      price: 29,
      billing: "/month",
      features: [
        "10,000 validations/month",
        "Email deliverability check",
        "Real-time API",
        "Basic support",
        "Community access",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Growth",
      description: "For growing teams and applications",
      price: 99,
      billing: "/month",
      features: [
        "100,000 validations/month",
        "Advanced validation checks",
        "Batch processing",
        "Webhooks & callbacks",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for enterprise scale",
      price: "Custom",
      billing: "Contact sales",
      features: [
        "Unlimited validations",
        "Dedicated infrastructure",
        "SLA guarantee (99.9%)",
        "Custom models",
        "Dedicated support",
        "On-premise deployment",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your email validation needs. All plans include access to our autonomous AI agent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 flex flex-col ${
                  plan.highlighted ? "border-2 border-primary bg-muted/50" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4">
                    <span className="px-3 py-1 text-sm font-semibold bg-primary text-primary-foreground rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  {plan.description}
                </p>

                <div className="mb-6">
                  {typeof plan.price === "number" ? (
                    <>
                      <span className="text-5xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">{plan.billing}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <p className="text-muted-foreground text-sm">{plan.billing}</p>
                    </>
                  )}
                </div>

                <Button
                  className="w-full mb-8"
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              All plans include:
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Real-time Validation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Instant email verification powered by AI
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  99.9% Uptime
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade reliability and security
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  REST API
                </h3>
                <p className="text-sm text-muted-foreground">
                  Easy integration with your applications
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
