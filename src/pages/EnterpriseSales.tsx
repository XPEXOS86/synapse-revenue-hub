import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Shield, Zap, Users } from "lucide-react";
import XpexLogo from "@/components/landing/XpexLogo";
import { toast } from "@/hooks/use-toast";

const benefits = [
  { icon: Building2, title: "Dedicated Infrastructure", desc: "Isolated tenant environment with custom SLAs" },
  { icon: Shield, title: "Advanced Security", desc: "SOC 2 readiness, encryption at rest, audit logs" },
  { icon: Zap, title: "Unlimited Throughput", desc: "Custom rate limits and priority processing" },
  { icon: Users, title: "Dedicated Support", desc: "Named account manager and onboarding assistance" },
];

const EnterpriseSales = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Request received", description: "Our enterprise team will contact you within 24 hours." });
      (e.target as HTMLFormElement).reset();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <XpexLogo className="w-7 h-7" />
            <span className="font-display font-bold text-base tracking-tight">Xpex Systems AI</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left – Info */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Enterprise</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
                Talk to Our Enterprise Team
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-10 max-w-md">
                Get a custom plan tailored to your organization's volume, security requirements and integration needs.
              </p>

              <div className="grid gap-6">
                {benefits.map((b) => (
                  <div key={b.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <b.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Form */}
            <div className="bg-card border border-border/50 rounded-xl p-8">
              <h2 className="font-display font-semibold text-lg mb-6">Request Enterprise Demo</h2>
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required maxLength={100} placeholder="Jane" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required maxLength={100} placeholder="Smith" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" required maxLength={255} placeholder="jane@company.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" required maxLength={200} placeholder="Acme Inc." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="volume">Estimated Monthly Volume</Label>
                  <Input id="volume" placeholder="e.g. 500,000 validations" maxLength={100} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Additional Details</Label>
                  <Textarea id="message" maxLength={1000} rows={4} placeholder="Tell us about your use case, integrations or security requirements..." />
                </div>
                <Button type="submit" size="lg" className="w-full font-semibold mt-2" disabled={loading}>
                  {loading ? "Sending..." : "Submit Request"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll respond within one business day.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnterpriseSales;
