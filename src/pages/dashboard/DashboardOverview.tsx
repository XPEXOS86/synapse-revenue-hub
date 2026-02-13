import { BarChart3, CreditCard, Key, Activity } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const apiData = [
  { day: "01", calls: 1200 },
  { day: "05", calls: 3400 },
  { day: "10", calls: 2800 },
  { day: "15", calls: 5100 },
  { day: "20", calls: 4200 },
  { day: "25", calls: 6800 },
  { day: "30", calls: 7200 },
];

const brainUsage = [
  { name: "Email Val.", calls: 12400 },
  { name: "Data Enrich.", calls: 8200 },
  { name: "Revenue Int.", calls: 5600 },
  { name: "Ad Optim.", calls: 9100 },
  { name: "Workflow", calls: 6300 },
];

const recentActivity = [
  { time: "2 min atrás", event: "API Key criada", brain: "Email Validation" },
  { time: "15 min atrás", event: "50k calls atingido", brain: "Ad Optimization" },
  { time: "1h atrás", event: "Webhook recebido", brain: "Workflow Automation" },
  { time: "3h atrás", event: "Novo lead enriquecido", brain: "Data Enrichment" },
  { time: "5h atrás", event: "Fatura gerada", brain: "Revenue Intelligence" },
];

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua plataforma RevLink Brain.</p>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total API Calls" value="41.600" change="+23%" trend="up" icon={BarChart3} />
        <MetricCard title="MRR" value="R$14.985" change="+12%" trend="up" icon={CreditCard} />
        <MetricCard title="API Keys Ativas" value="28" change="+5" trend="up" icon={Key} />
        <MetricCard title="Agents Ativos" value="12" change="+2" trend="up" icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* API Usage Chart */}
        <div className="lg:col-span-2 bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Consumo de API — Últimos 30 dias</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={apiData}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(190, 95%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(190, 95%, 55%)" stopOpacity={0} />
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
              <Area type="monotone" dataKey="calls" stroke="hsl(190, 95%, 55%)" fill="url(#colorCalls)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
          <h3 className="font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm">{a.event}</p>
                  <p className="text-xs text-muted-foreground">{a.brain} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brain Usage */}
      <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
        <h3 className="font-semibold mb-4">Consumo por Brain</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={brainUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 16%)" />
            <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} />
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
            <Bar dataKey="calls" fill="hsl(190, 95%, 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverview;
