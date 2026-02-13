import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const usageData = [
  { date: "Sem 1", emailVal: 3200, dataEnrich: 1800, revenue: 1200, adOpt: 2400, workflow: 1600 },
  { date: "Sem 2", emailVal: 3800, dataEnrich: 2100, revenue: 1500, adOpt: 2800, workflow: 1900 },
  { date: "Sem 3", emailVal: 4200, dataEnrich: 2600, revenue: 1800, adOpt: 3200, workflow: 2100 },
  { date: "Sem 4", emailVal: 5100, dataEnrich: 3700, revenue: 2100, adOpt: 3800, workflow: 2700 },
];

const endpoints = [
  { name: "/validate-email", brain: "Email Validation", calls: 12400, status: "healthy" },
  { name: "/enrich-lead", brain: "Data Enrichment", calls: 8200, status: "healthy" },
  { name: "/revenue-report", brain: "Revenue Intelligence", calls: 5600, status: "warning" },
  { name: "/optimize-campaign", brain: "Ad Optimization", calls: 9100, status: "healthy" },
  { name: "/trigger-workflow", brain: "Workflow Automation", calls: 6300, status: "healthy" },
];

const DashboardUsage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">API Usage</h1>
        <p className="text-sm text-muted-foreground">Monitoramento detalhado de consumo por Brain.</p>
      </div>

      <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
        <h3 className="font-semibold mb-4">Consumo Semanal por Brain</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={usageData}>
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
            <Tooltip contentStyle={{ backgroundColor: "hsl(222, 44%, 8%)", border: "1px solid hsl(222, 20%, 16%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)", fontSize: 13 }} />
            <Area type="monotone" dataKey="emailVal" stroke="#22d3ee" fill="url(#cEmail)" strokeWidth={2} name="Email Val." />
            <Area type="monotone" dataKey="dataEnrich" stroke="#a78bfa" fill="url(#cData)" strokeWidth={2} name="Data Enrich." />
            <Area type="monotone" dataKey="adOpt" stroke="#f97316" fill="none" strokeWidth={2} name="Ad Optim." />
            <Area type="monotone" dataKey="revenue" stroke="#34d399" fill="none" strokeWidth={2} name="Revenue Int." />
            <Area type="monotone" dataKey="workflow" stroke="#fb7185" fill="none" strokeWidth={2} name="Workflow" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
        <h3 className="font-semibold mb-4">Endpoints Ativos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="text-left py-3 font-medium">Endpoint</th>
                <th className="text-left py-3 font-medium">Brain</th>
                <th className="text-right py-3 font-medium">Calls (30d)</th>
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
      </div>
    </div>
  );
};

export default DashboardUsage;
