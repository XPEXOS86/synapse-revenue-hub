import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const currentPlan = {
  name: "Growth",
  price: "R$1.997",
  period: "/mês",
  renewDate: "13 Mar 2026",
  apiCalls: { used: 32400, limit: 50000 },
};

const invoices = [
  { id: "INV-2026-02", date: "01 Fev 2026", amount: "R$1.997,00", status: "Pago" },
  { id: "INV-2026-01", date: "01 Jan 2026", amount: "R$1.997,00", status: "Pago" },
  { id: "INV-2025-12", date: "01 Dez 2025", amount: "R$497,00", status: "Pago" },
  { id: "INV-2025-11", date: "01 Nov 2025", amount: "R$497,00", status: "Pago" },
];

const DashboardBilling = () => {
  const usagePercent = Math.round((currentPlan.apiCalls.used / currentPlan.apiCalls.limit) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Billing</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu plano e faturas.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card rounded-xl border border-primary/30 p-6 shadow-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Plano Atual</h3>
            <Badge className="text-xs">Ativo</Badge>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold">{currentPlan.price}</span>
            <span className="text-muted-foreground text-sm">{currentPlan.period}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Plano <span className="text-foreground font-medium">{currentPlan.name}</span> · Renova em {currentPlan.renewDate}
          </p>

          {/* Usage bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>API Calls este mês</span>
              <span>{currentPlan.apiCalls.used.toLocaleString()} / {currentPlan.apiCalls.limit.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{usagePercent}% utilizado</p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button size="sm" className="font-semibold">Upgrade</Button>
            <Button size="sm" variant="outline">Cancelar</Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-card rounded-xl border border-border/50 p-6 flex flex-col justify-between"
        >
          <h3 className="font-semibold text-lg mb-4">Resumo Financeiro</h3>
          <div className="space-y-4 flex-1">
            {[
              { label: "MRR atual", value: "R$14.985" },
              { label: "Total faturado (2026)", value: "R$3.994" },
              { label: "Próxima cobrança", value: currentPlan.renewDate },
              { label: "Método de pagamento", value: "•••• 4242" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-5 w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            Atualizar pagamento
          </Button>
        </motion.div>
      </div>

      {/* Invoices */}
      <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
        <h3 className="font-semibold mb-4">Histórico de Faturas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="text-left py-3 font-medium">Fatura</th>
                <th className="text-left py-3 font-medium">Data</th>
                <th className="text-right py-3 font-medium">Valor</th>
                <th className="text-right py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/30">
                  <td className="py-3 font-mono text-xs">{inv.id}</td>
                  <td className="py-3 text-muted-foreground">{inv.date}</td>
                  <td className="py-3 text-right">{inv.amount}</td>
                  <td className="py-3 text-right">
                    <Badge variant="default" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      {inv.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardBilling;
