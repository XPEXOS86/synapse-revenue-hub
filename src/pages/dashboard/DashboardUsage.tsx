import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Clock, AlertTriangle, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface UsageRow {
  endpoint: string;
  brain: string;
  status_code: number | null;
  created_at: string;
  response_time_ms: number | null;
}

const DashboardUsage = () => {
  const [loading, setLoading] = useState(true);
  const [usageLogs, setUsageLogs] = useState<UsageRow[]>([]);

  const fetchUsage = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("usage_logs")
      .select("endpoint, brain, status_code, created_at, response_time_ms")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (data) setUsageLogs(data as UsageRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsage(); }, []);

  const totalCalls = usageLogs.length;
  const avgResponseTime = totalCalls > 0
    ? Math.round(usageLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / totalCalls)
    : 0;
  const errorCount = usageLogs.filter(l => l.status_code && l.status_code >= 400).length;
  const successRate = totalCalls > 0 ? (((totalCalls - errorCount) / totalCalls) * 100).toFixed(1) : "0";

  const dailyMap: Record<string, { calls: number; totalMs: number }> = {};
  usageLogs.forEach((l) => {
    const day = new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    if (!dailyMap[day]) dailyMap[day] = { calls: 0, totalMs: 0 };
    dailyMap[day].calls++;
    dailyMap[day].totalMs += l.response_time_ms || 0;
  });
  const dailyChart = Object.entries(dailyMap)
    .map(([day, d]) => ({ day, calls: d.calls, avg_ms: Math.round(d.totalMs / d.calls) }))
    .reverse();

  const recentLogs = usageLogs.slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">API Usage</h1>
          <p className="text-sm text-muted-foreground">
            {totalCalls === 0
              ? "Nenhum dado de uso ainda — faça chamadas à API para ver métricas."
              : `${totalCalls} chamadas registradas`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsage}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: totalCalls.toLocaleString(), icon: Activity, color: "text-primary" },
          { label: "Avg Response", value: `${avgResponseTime}ms`, icon: Clock, color: "text-primary" },
          { label: "Success Rate", value: `${successRate}%`, icon: Zap, color: "text-green-400" },
          { label: "Errors", value: errorCount.toString(), icon: AlertTriangle, color: errorCount > 0 ? "text-red-400" : "text-muted-foreground" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gradient-card rounded-xl border border-border/50 p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {totalCalls > 0 && (
        <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Chamadas por Dia</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyChart}>
              <defs>
                <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  fontSize: 13,
                }}
              />
              <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fill="url(#callsGrad)" strokeWidth={2} name="Chamadas" />
              <Area type="monotone" dataKey="avg_ms" stroke="hsl(var(--accent))" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Avg ms" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent activity */}
      {recentLogs.length > 0 && (
        <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Logs Recentes</h3>
          <div className="space-y-3">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="font-mono text-xs">{log.endpoint}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge
                    variant={log.status_code && log.status_code >= 400 ? "destructive" : "default"}
                    className="text-xs"
                  >
                    {log.status_code || "—"}
                  </Badge>
                  <span>{log.response_time_ms ? `${log.response_time_ms}ms` : "—"}</span>
                  <span>{new Date(log.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardUsage;
