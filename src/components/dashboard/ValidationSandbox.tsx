import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, ShieldCheck, ShieldAlert, ShieldX, CheckCircle, AlertCircle, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Result {
  email: string;
  score: number;
  risk: string;
  checks: Record<string, boolean>;
  response_time_ms: number;
}

const ValidationSandbox = ({ apiKey }: { apiKey?: string }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleValidate = useCallback(async () => {
    if (!apiKey) {
      toast.error("Configure sua API Key em Dashboard → API Keys");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Insira um email válido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro");
        return;
      }
      setResult(data);
      toast.success(`Score: ${data.score}/100`);
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [apiKey, email]);

  const riskIcon = result?.risk === "low" ? ShieldCheck : result?.risk === "medium" ? ShieldAlert : ShieldX;
  const RiskIcon = riskIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-card rounded-xl border border-border/50 p-6"
    >
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        Sandbox de Validação
      </h3>

      <div className="flex gap-3">
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleValidate()}
          className="flex-1 font-mono text-sm"
        />
        <Button onClick={handleValidate} disabled={loading} className="gap-2 min-w-[120px]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? "..." : "Validar"}
        </Button>
      </div>

      <div className="flex gap-2 mt-3 flex-wrap">
        {["ceo@google.com", "test@mailinator.com", "user@empresa.com.br"].map((s) => (
          <button
            key={s}
            onClick={() => setEmail(s)}
            className="text-xs font-mono px-2 py-1 rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 pt-5 border-t border-border/50"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                  <circle
                    cx="30" cy="30" r="24" fill="none"
                    stroke={result.score >= 80 ? "hsl(var(--primary))" : result.score >= 50 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.score / 100) * 151} 151`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{result.score}</span>
                </div>
              </div>
              <div>
                <p className="font-mono text-sm">{result.email}</p>
                <Badge className={`mt-1 gap-1 text-xs ${
                  result.risk === "low" ? "bg-primary/10 text-primary border-primary/20"
                    : result.risk === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}>
                  <RiskIcon className="w-3 h-3" />
                  {result.risk === "low" ? "Baixo Risco" : result.risk === "medium" ? "Risco Médio" : "Alto Risco"}
                </Badge>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {result.response_time_ms}ms
              </div>
            </div>

            <div className="space-y-1.5">
              {Object.entries(result.checks).map(([key, passed]) => (
                <div key={key} className="flex items-center gap-2 text-sm py-1">
                  {passed ? <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />}
                  <span className="text-muted-foreground">{key.replace(/_/g, " ")}</span>
                  <span className={`ml-auto text-xs font-medium ${passed ? "text-primary" : "text-destructive"}`}>
                    {passed ? "PASS" : "FAIL"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ValidationSandbox;
