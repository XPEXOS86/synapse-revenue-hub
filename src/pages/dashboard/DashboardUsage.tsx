import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
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

const BRAIN_COLORS: Record<string, string> = {
  "email-validation": "#22d3ee",
  "data-enrichment": "#a78bfa",
  "revenue-intelligence": "#f97316",
  "ad-optimization": "#10b981",
  "workflow-automation": "#f43f5e",
};

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

  // KPIs
  const totalCalls = usageLogs.length;
  const avgResponseTime = totalCalls > 0
    ? Math.round(usageLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / totalCalls)
    : 0;
  const errorCount = usageLogs.filter(l => l.status_code && l.status_code >= 400).length;
  const errorRate = totalCalls > 0 ? ((errorCount / totalCalls) * 100).toFixed(1) : "0";
  const successRate = totalCalls > 0 ? (((totalCalls - errorCount) / totalCalls) * 100).toFixed(1) : "0";

  // Daily chart data
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

  // Brain breakdown for pie chart
  const brainMap: Record<string, number> = {};
  usageLogs.forEach(l => { brainMap[l.brain] = (brainMap[l.brain] || 0) + 1; });
  const brainPie = Object.entries(brainMap)
    .map(([name, value]) => ({ name: name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value, key: name }))
    .sort((a, b) => b.value - a.value);

  // Per-brain response time
  const brainRtMap: Record<string, { total: number; count: number }> = {};
  usageLogs.forEach(l => {
    if (!brainRtMap[l.brain]) brainRtMap[l.brain] = { total: 0, count: 0 };
    brainRtMap[l.brain].total += l.response_time_ms || 0;
    brainRtMap[l.brain].count++;
  });
  const brainRtChart = Object.entries(brainRtMap)
    .map(([brain, d]) => ({
      name: brain.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      avg_ms: Math.round(d.total / d.count),
      key: brain,
    }))
    .sort((a, b) => b.avg_ms - a.avg_ms);

  // Endpoints table
  const endpointMap = usageLogs.reduce<Record<string, { brain: string; calls: number; errors: number; totalMs: number }>>((acc, log) => {
    if (!acc[log.endpoint]) acc[log.endpoint] = { brain: log.brain, calls: 0, errors: 0, totalMs: 0 };
    acc[log.endpoint].calls++;
    acc[log.endpoint].totalMs += log.response_time_ms || 0;
    if (log.status_code && log.status_code >= 400) acc[log.endpoint].errors++;
    return acc;
  }, {});

  const endpoints = Object.entries(endpointMap).map(([name, data]) => ({
    name,
    brain: data.brain,
    calls: data.calls,
    avgMs: Math.round(data.totalMs / data.calls),
    errorRate: ((data.errors / data.calls) * 100).toFixed(1),
    status: data.errors / data.calls > 0.1 ? "warning" : "healthy",
  })).sort((a, b) => b.calls - a.calls);

  // Recent logs
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
              : `${totalCalls} chamadas registradas · ${Object.keys(brainMap).length} Brains ativos`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsage}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: totalCalls.toLocaleString(), icon: Activity, color: "text-cyan-400" },
          { label: "Avg Response", value: `${avgResponseTime}ms`, icon: Clock, color: "text-violet-400" },
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

      {/* Charts row */}
      {totalCalls > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily calls chart */}
          <div className="lg:col-span-2 bg-gradient-card rounded-xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Chamadas por Dia</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyChart}>
                <defs>
                  <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
                <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 44%, 8%)",
                    border: "1px solid hsl(222, 20%, 16%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                    fontSize: 13,
                  }}
                />
                <Area type="monotone" dataKey="calls" stroke="#22d3ee" fill="url(#callsGrad)" strokeWidth={2} name="Chamadas" />
                <Area type="monotone" dataKey="avg_ms" stroke="#a78bfa" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Avg ms" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Brain distribution pie */}
          <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Distribuição por Brain</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={brainPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {brainPie.map((entry) => (
                    <Cell key={entry.key} fill={BRAIN_COLORS[entry.key] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 44%, 8%)",
                    border: "1px solid hsl(222, 20%, 16%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {brainPie.map((b) => (
                <div key={b.key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BRAIN_COLORS[b.key] || "#6b7280" }} />
                    <span className="text-muted-foreground">{b.name}</span>
                  </div>
                  <span className="font-medium">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Response time by Brain */}
      {brainRtChart.length > 0 && (
        <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Tempo de Resposta Médio por Brain</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={brainRtChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
              <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} unit="ms" />
              <YAxis type="category" dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} width={140} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 44%, 8%)",
                  border: "1px solid hsl(222, 20%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(210, 40%, 96%)",
                  fontSize: 13,
                }}
                formatter={(v: number) => [`${v}ms`, "Avg"]}
              />
              <Bar dataKey="avg_ms" radius={[0, 4, 4, 0]}>
                {brainRtChart.map((entry) => (
                  <Cell key={entry.key} fill={BRAIN_COLORS[entry.key] || "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Endpoints table */}
      <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
        <h3 className="font-semibold mb-4">Endpoints</h3>
        {endpoints.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum endpoint utilizado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 font-medium">Endpoint</th>
                  <th className="text-left py-3 font-medium">Brain</th>
                  <th className="text-right py-3 font-medium">Calls</th>
                  <th className="text-right py-3 font-medium">Avg (ms)</th>
                  <th className="text-right py-3 font-medium">Errors</th>
                  <th className="text-right py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep) => (
                  <tr key={ep.name} className="border-b border-border/30">
                    <td className="py-3 font-mono text-xs">{ep.name}</td>
                    <td className="py-3 text-muted-foreground text-xs">{ep.brain}</td>
                    <td className="py-3 text-right">{ep.calls.toLocaleString()}</td>
                    <td className="py-3 text-right">{ep.avgMs}ms</td>
                    <td className="py-3 text-right">{ep.errorRate}%</td>
                    <td className="py-3 text-right">
                      <Badge variant={ep.status === "healthy" ? "default" : "destructive"} className="text-xs">
                        {ep.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent activity */}
      {recentLogs.length > 0 && (
        <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Logs Recentes</h3>
          <div className="space-y-3">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: BRAIN_COLORS[log.brain] || "#6b7280" }}
                  />
                  <span className="font-mono text-xs">{log.endpoint}</span>
                  <span className="text-xs text-muted-foreground">{log.brain}</span>
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
