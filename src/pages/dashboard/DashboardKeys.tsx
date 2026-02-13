import { useState, useEffect, useCallback } from "react";
import { Copy, Eye, EyeOff, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  brain: string;
  rate_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  raw_key?: string;
}

const DashboardKeys = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchKeys = useCallback(async () => {
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, brain, rate_limit, is_active, last_used_at, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) setKeys(data as ApiKey[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.functions.invoke("manage-keys", {
          body: { action: "ensure-tenant" },
        });
      }
      fetchKeys();
    };
    init();
  }, [fetchKeys]);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);

    const { data, error } = await supabase.functions.invoke("manage-keys", {
      body: { action: "create-api-key", name: newKeyName, brain: "email-validation" },
    });

    setCreating(false);

    if (error || data?.error) {
      toast({ title: "Erro", description: data?.error || "Falha ao criar chave", variant: "destructive" });
      return;
    }

    const createdKey = data.api_key;
    setNewlyCreatedKey(createdKey.raw_key);
    setKeys((prev) => [createdKey, ...prev]);
    setNewKeyName("");
    setDialogOpen(false);
    toast({ title: "API Key criada!", description: "Copie a chave agora — ela não será exibida novamente." });
  };

  const deleteKey = async (keyId: string) => {
    await supabase.functions.invoke("manage-keys", {
      body: { action: "delete-api-key", keyId },
    });
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
    toast({ title: "Removida", description: "API Key desativada com sucesso." });
  };

  const copyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Copiado para o clipboard." });
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const timeAgo = (d: string | null) => {
    if (!d) return "Nunca";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">API Keys</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas chaves de acesso à API de validação de emails.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Nova Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Ex: Production Key" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">A key será criada para o endpoint Email Validation.</p>
              <Button onClick={createKey} disabled={creating || !newKeyName.trim()} className="w-full">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Key"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {newlyCreatedKey && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/30 rounded-xl p-4"
        >
          <p className="text-sm font-semibold text-primary mb-2">⚠️ Copie sua chave agora — ela não será exibida novamente:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted/50 rounded-md px-3 py-2 font-mono break-all">
              {newlyCreatedKey}
            </code>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyKey(newlyCreatedKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setNewlyCreatedKey(null)}>
            Fechar
          </Button>
        </motion.div>
      )}

      {keys.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Nenhuma API Key ainda. Crie sua primeira chave para começar.</p>
        </div>
      ) : (
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
                  <p className="text-xs text-muted-foreground">
                    Criada em {formatDate(k.created_at)} · Último uso: {timeAgo(k.last_used_at)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">Email Validation</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted/50 rounded-md px-3 py-2 font-mono">
                  {revealedKeys.has(k.id) ? `${k.key_prefix}••••••••••••••••••••••••` : `${k.key_prefix}••••••••••••••••`}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleReveal(k.id)}>
                  {revealedKeys.has(k.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyKey(k.key_prefix + "...")}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteKey(k.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardKeys;
