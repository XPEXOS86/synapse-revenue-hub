import { useState, useEffect } from "react";
import { Check, CreditCard, Loader2, ExternalLink, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, type PlanTier } from "@/config/plans";

const DashboardBilling = () => {
  const { session, subscription, refreshSubscription } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [invoices, setInvoices] = useState<Array<{
    id: string;
    stripe_invoice_id: string;
    amount_due_cents: number;
    amount_paid_cents: number;
    status: string;
    created_at: string;
  }>>([]);

  // Check for checkout return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Assinatura ativada com sucesso!");
      refreshSubscription();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("checkout") === "cancel") {
      toast.info("Checkout cancelado");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refreshSubscription]);

  // Load invoices
  useEffect(() => {
    const loadInvoices = async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setInvoices(data);
    };
    loadInvoices();
  }, [subscription]);

  const handleCheckout = async (priceId: string) => {
    if (!session) {
      toast.error("Faça login primeiro");
      return;
    }
    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      toast.error("Erro ao criar checkout");
      console.error(err);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    if (!session) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      toast.error("Erro ao abrir portal");
      console.error(err);
    } finally {
      setPortalLoading(false);
    }
  };

  const currentTier = subscription.tier;
  const currentPlan = currentTier ? PLANS[currentTier] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Billing</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu plano e faturas.</p>
      </div>

      {/* Current Subscription Status */}
      {subscription.subscribed && currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card rounded-xl border border-primary/30 p-6 shadow-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Plano Atual
            </h3>
            <Badge className="text-xs">
              {subscription.status === "active" ? "Ativo" : subscription.status}
            </Badge>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold">{currentPlan.display_price}</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Plano <span className="text-foreground font-medium">{currentPlan.name}</span>
            {subscription.subscriptionEnd && (
              <> · Renova em {new Date(subscription.subscriptionEnd).toLocaleDateString("pt-BR")}</>
            )}
          </p>
          {subscription.cancelAtPeriodEnd && (
            <p className="text-sm text-amber-400">⚠️ Cancelamento agendado para o final do período</p>
          )}
          <div className="flex gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={handlePortal} disabled={portalLoading}>
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Gerenciar Assinatura
            </Button>
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {(Object.entries(PLANS) as [PlanTier, typeof PLANS[PlanTier]][]).map(([tier, plan], i) => {
          const isActive = currentTier === tier;
          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-6 ${
                isActive
                  ? "border-primary/50 bg-primary/5 shadow-glow"
                  : "border-border/50 bg-gradient-card"
              }`}
            >
              {isActive && (
                <Badge className="mb-3 text-xs">Seu Plano</Badge>
              )}
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">{plan.display_price}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                   {`${plan.included_credits.toLocaleString()} credits/mo`}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                   Full API access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                   Bulk validation
                </li>
                {tier === "scale" && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Dedicated support
                  </li>
                )}
              </ul>
              {isActive ? (
                <Button size="sm" variant="outline" className="w-full" disabled>
                   Current Plan
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleCheckout(plan.price_id)}
                  disabled={!!checkoutLoading}
                >
                  {checkoutLoading === plan.price_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {subscription.subscribed ? "Switch Plan" : "Subscribe"}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Histórico de Faturas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 font-medium">ID</th>
                  <th className="text-left py-3 font-medium">Data</th>
                  <th className="text-right py-3 font-medium">Valor</th>
                  <th className="text-right py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/30">
                    <td className="py-3 font-mono text-xs">{inv.stripe_invoice_id?.slice(0, 20) || inv.id.slice(0, 8)}</td>
                    <td className="py-3 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 text-right">${((inv.amount_paid_cents || inv.amount_due_cents) / 100).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-xs">
                        {inv.status === "paid" && <Check className="h-3 w-3 mr-1" />}
                        {inv.status === "paid" ? "Pago" : inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBilling;
