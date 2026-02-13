import { useState, useEffect } from "react";
import { BarChart3, CreditCard, Key, Activity, Loader2, Mail, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import CreditBalanceCard from "@/components/dashboard/CreditBalanceCard";
import BulkUploadCard from "@/components/dashboard/BulkUploadCard";
import ValidationSandbox from "@/components/dashboard/ValidationSandbox";
import IntegrationStatusCards from "@/components/dashboard/IntegrationStatusCards";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [totalCalls, setTotalCalls] = useState(0);
  const [activeKeys, setActiveKeys] = useState(0);
  const [successRate, setSuccessRate] = useState("0");
  const [riskPercent, setRiskPercent] = useState("0");
  const [chartData, setChartData] = useState<{ day: string; calls: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<{ endpoint: string; brain: string; created_at: string; status_code: number | null }[]>([]);
  const [firstApiKey, setFirstApiKey] = useState<string | undefined>();

  useEffect(() => {
    const fetchAll = async () => {
      const [keysRes, logsRes, apiKeysRes] = await Promise.all([
        supabase.from("api_keys").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("usage_logs").select("endpoint, brain, created_at, status_code").order("created_at", { ascending: false }).limit(500),
        supabase.from("api_keys").select("key_prefix").eq("is_active", true).limit(1).maybeSingle(),
      ]);

      setActiveKeys(keysRes.count ?? 0);
      if (apiKeysRes.data) {
        setFirstApiKey(apiKeysRes.data.key_prefix);
      }

      const logs = (logsRes.data ?? []) as typeof recentLogs;
      setTotalCalls(logs.length);
      setRecentLogs(logs.slice(0, 5));

      const errors = logs.filter(l => l.status_code && l.status_code >= 400).length;
      setSuccessRate(logs.length > 0 ? (((logs.length - errors) / logs.length) * 100).toFixed(1) : "100");
      // Risk % is a mock for now
      setRiskPercent(logs.length > 0 ? "12.4" : "0");

      const dayMap: Record<string, number> = {};
      logs.forEach((l) => {
        const day = new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit" });
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      setChartData(Object.entries(dayMap).map(([day, calls]) => ({ day, calls })).reverse());

      setLoading(false);
    };
    fetchAll();
  }, []);

  const timeAgo = (d: string) => {
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
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do Gold Mail Validator.</p>
      </div>

      {/* Animated Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Emails Validados" value={totalCalls.toLocaleString()} change="" trend="up" icon={Mail} delay={0} />
        <MetricCard title="Taxa de Sucesso" value={`${successRate}%`} change="" trend="up" icon={CheckCircle} delay={0.05} />
        <MetricCard title="Risco Detectado" value={`${riskPercent}%`} change="" trend="down" icon={AlertTriangle} delay={0.1} />
        <MetricCard title="API Keys Ativas" value={activeKeys.toString()} change="" trend="up" icon={Key} delay={0.15} />
      </div>

      {/* Credit Balance + Bulk Upload */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CreditBalanceCard />
        <BulkUploadCard />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-gradient-card rounded-xl border border-border/50 p-5"
        >
          <h3 className="font-semibold mb-4">Consumo de API — Últimos 30 dias</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-16 text-center">Nenhum dado de uso ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: 13 }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fill="url(#colorCalls)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-card rounded-xl border border-border/50 p-5"
        >
          <h3 className="font-semibold mb-4">Atividade Recente</h3>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atividade ainda.</p>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${a.status_code && a.status_code >= 400 ? "bg-destructive" : "bg-primary"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{a.endpoint}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Sandbox + Integrations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ValidationSandbox apiKey={firstApiKey} />
        <IntegrationStatusCards />
      </div>
    </div>
  );
};

export default DashboardOverview;
