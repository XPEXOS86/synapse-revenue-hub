import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Sandbox = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // Mock validation response
      await new Promise((resolve) => setTimeout(resolve, 800));
      setResult({
        email,
        valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        deliverable: Math.random() > 0.3,
        score: Math.floor(Math.random() * 100),
        riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Test GoldMail AI
            </h1>
            <p className="text-xl text-muted-foreground">
              Try real-time email validation powered by our autonomous agent
            </p>
          </div>

          <Card className="p-8 border border-border">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleValidate()}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleValidate}
                disabled={!email || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Validating..." : "Validate Email"}
              </Button>
            </div>

            {result && (
              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <h3 className="font-semibold text-lg">Validation Result</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Valid Format</p>
                    <p className="text-2xl font-bold">
                      {result.valid ? "✓" : "✗"}
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Deliverable</p>
                    <p className="text-2xl font-bold">
                      {result.deliverable ? "✓" : "✗"}
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">{result.score}%</p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <p className="text-2xl font-bold capitalize">
                      {result.riskLevel}
                    </p>
                  </div>
                </div>

                <pre className="mt-6 p-4 bg-slate-950 text-slate-100 rounded text-sm overflow-auto max-h-48">
{JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </Card>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Ready to integrate with your application?
            </p>
            <Button variant="outline">
              View API Documentation
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sandbox;
