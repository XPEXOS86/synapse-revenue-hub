import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const fetchUsage = async () => {
      const { data } = await supabase
        .from("usage_logs")
        .select("endpoint, brain, status_code, created_at, response_time_ms")
        .order("created_at", { ascending: false })
        .limit(500);

      if (data) setUsageLogs(data as UsageRow[]);
      setLoading(false);
    };
    fetchUsage();
  }, []);

  // Aggregate by week
  const weeklyData = usageLogs.reduce<Record<string, Record<string, number>>>((acc, log) => {
    const date = new Date(log.created_at);
    const weekNum = `Sem ${Math.ceil(date.getDate() / 7)}`;
    if (!acc[weekNum]) acc[weekNum] = {};
    const brain = log.brain || "other";
    acc[weekNum][brain] = (acc[weekNum][brain] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(weeklyData).map(([date, brains]) => ({
    date,
    "email-validation": brains["email-validation"] || 0,
    "data-enrichment": brains["data-enrichment"] || 0,
    other: Object.entries(brains)
      .filter(([k]) => !["email-validation", "data-enrichment"].includes(k))
      .reduce((s, [, v]) => s + v, 0),
  }));

  // Aggregate endpoints
  const endpointMap = usageLogs.reduce<Record<string, { brain: string; calls: number; errors: number }>>((acc, log) => {
    if (!acc[log.endpoint]) acc[log.endpoint] = { brain: log.brain, calls: 0, errors: 0 };
    acc[log.endpoint].calls++;
    if (log.status_code && log.status_code >= 400) acc[log.endpoint].errors++;
    return acc;
  }, {});

  const endpoints = Object.entries(endpointMap).map(([name, data]) => ({
    name,
    brain: data.brain,
    calls: data.calls,
    status: data.errors / data.calls > 0.1 ? "warning" : "healthy",
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">API Usage</h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento detalhado de consumo por Brain.
          {usageLogs.length === 0 && " Nenhum dado de uso ainda — faça chamadas à API para ver métricas."}
        </p>
      </div>

      {chartData.length > 0 && (
        <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Consumo Semanal por Brain</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cEmail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cData" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
              <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
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
              <Area type="monotone" dataKey="email-validation" stroke="#22d3ee" fill="url(#cEmail)" strokeWidth={2} name="Email Val." />
              <Area type="monotone" dataKey="data-enrichment" stroke="#a78bfa" fill="url(#cData)" strokeWidth={2} name="Data Enrich." />
              <Area type="monotone" dataKey="other" stroke="#f97316" fill="none" strokeWidth={2} name="Other" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
        <h3 className="font-semibold mb-4">Endpoints Ativos</h3>
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
                  <th className="text-right py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep) => (
                  <tr key={ep.name} className="border-b border-border/30">
                    <td className="py-3 font-mono text-xs">{ep.name}</td>
                    <td className="py-3 text-muted-foreground">{ep.brain}</td>
                    <td className="py-3 text-right">{ep.calls.toLocaleString()}</td>
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
    </div>
  );
};

export default DashboardUsage;
