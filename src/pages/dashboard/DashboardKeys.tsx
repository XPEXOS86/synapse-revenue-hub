import { useState } from "react";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  brain: string;
}

const initialKeys: ApiKey[] = [
  { id: "1", name: "Production Key", key: "rlb_live_a1b2c3d4e5f6g7h8i9j0", created: "10 Jan 2026", lastUsed: "2 min atrás", brain: "All Brains" },
  { id: "2", name: "Email Validation", key: "rlb_ev_k1l2m3n4o5p6q7r8s9t0", created: "15 Jan 2026", lastUsed: "1h atrás", brain: "Email Validation" },
  { id: "3", name: "Data Enrichment", key: "rlb_de_u1v2w3x4y5z6a7b8c9d0", created: "20 Jan 2026", lastUsed: "3h atrás", brain: "Data Enrichment" },
];

const DashboardKeys = () => {
  const [keys] = useState<ApiKey[]>(initialKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copiado!", description: "API key copiada para o clipboard." });
  };

  const maskKey = (key: string) => key.slice(0, 8) + "••••••••••••••••";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">API Keys</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas chaves de acesso à API.</p>
        </div>
        <Button size="sm" className="font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Nova Key
        </Button>
      </div>

      <div className="space-y-3">
        {keys.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gradient-card rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{k.name}</h3>
                <p className="text-xs text-muted-foreground">Criada em {k.created} · Último uso: {k.lastUsed}</p>
              </div>
              <Badge variant="outline" className="text-xs">{k.brain}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted/50 rounded-md px-3 py-2 font-mono">
                {visibleKeys.has(k.id) ? k.key : maskKey(k.key)}
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisibility(k.id)}>
                {visibleKeys.has(k.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyKey(k.key)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardKeys;
