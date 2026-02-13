import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Database, TrendingUp, Target, Workflow, Copy, Play, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface EndpointDoc {
  id: string;
  name: string;
  icon: React.ElementType;
  method: string;
  path: string;
  description: string;
  authType: string;
  sampleRequest: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
  fields: { name: string; type: string; required: boolean; description: string }[];
}

const endpoints: EndpointDoc[] = [
  {
    id: "validate-email",
    name: "Email Validation",
    icon: Mail,
    method: "POST",
    path: "/functions/v1/validate-email",
    description: "Valide emails em tempo real com score de confiança, detecção de disposable e verificação de formato.",
    authType: "x-api-key",
    fields: [
      { name: "email", type: "string", required: true, description: "Email para validar" },
    ],
    sampleRequest: { email: "user@company.com" },
    sampleResponse: { email: "user@company.com", score: 100, risk: "low", checks: { valid_format: true, has_mx_likely: true, not_disposable: true, not_role_based: true, domain_length_ok: true }, response_time_ms: 12 },
  },
  {
    id: "enrich-data",
    name: "Data Enrichment",
    icon: Database,
    method: "POST",
    path: "/functions/v1/enrich-data",
    description: "Enriqueça leads com dados de empresa, classificação B2B/B2C, score de intenção e ICP match.",
    authType: "x-api-key",
    fields: [
      { name: "email", type: "string", required: false, description: "Email para enriquecer" },
      { name: "phone", type: "string", required: false, description: "Telefone para enriquecer" },
      { name: "domain", type: "string", required: false, description: "Domínio para enriquecer" },
    ],
    sampleRequest: { email: "ceo@techcorp.com", phone: "5511999999999" },
    sampleResponse: { input: { email: "ceo@techcorp.com", phone: "5511999999999" }, enriched: { email_data: { domain: "techcorp.com", is_business_email: true, classification: "B2B" }, phone_data: { country_code: "BR", is_mobile: true }, intent_score: 90, icp_match: "high" }, response_time_ms: 15 },
  },
  {
    id: "revenue-intel",
    name: "Revenue Intelligence",
    icon: TrendingUp,
    method: "POST",
    path: "/functions/v1/revenue-intel",
    description: "Analise funis de conversão com taxas, ARPU, LTV estimado e sugestões de otimização.",
    authType: "x-api-key",
    fields: [
      { name: "visitors", type: "number", required: true, description: "Total de visitantes" },
      { name: "leads", type: "number", required: true, description: "Total de leads" },
      { name: "trials", type: "number", required: false, description: "Total de trials" },
      { name: "customers", type: "number", required: true, description: "Total de clientes" },
      { name: "revenue", type: "number", required: false, description: "Receita total" },
    ],
    sampleRequest: { visitors: 10000, leads: 500, trials: 100, customers: 30, revenue: 15000 },
    sampleResponse: { analysis: { conversion_rates: { visitor_to_lead: "5.00%", lead_to_trial: "20.00%", trial_to_customer: "30.00%", overall: "0.30%" }, arpu: "500.00", ltv_estimate: "6000.00", suggestions: ["Funnel looks healthy!"] }, response_time_ms: 8 },
  },
  {
    id: "ad-optimization",
    name: "Ad Optimization",
    icon: Target,
    method: "POST",
    path: "/functions/v1/ad-optimization",
    description: "Analise performance de campanhas com CTR, CPC, ROAS e sugestões de otimização automática.",
    authType: "x-api-key",
    fields: [
      { name: "spend", type: "number", required: true, description: "Investimento total" },
      { name: "impressions", type: "number", required: true, description: "Total de impressões" },
      { name: "clicks", type: "number", required: true, description: "Total de cliques" },
      { name: "conversions", type: "number", required: false, description: "Total de conversões" },
      { name: "revenue", type: "number", required: false, description: "Receita gerada" },
      { name: "platform", type: "string", required: false, description: "Plataforma (meta, google)" },
    ],
    sampleRequest: { spend: 5000, impressions: 250000, clicks: 5000, conversions: 150, revenue: 22500, platform: "meta" },
    sampleResponse: { analysis: { ctr: "2.00%", cpc: "1.00", cpa: "33.33", roas: "4.50", performance_score: 100, suggestions: ["Campaign metrics look strong!"] }, response_time_ms: 10 },
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation",
    icon: Workflow,
    method: "POST",
    path: "/functions/v1/workflow-automation",
    description: "Valide e simule workflows multi-step entre serviços como Zapier, HubSpot, Stripe e mais.",
    authType: "x-api-key",
    fields: [
      { name: "action", type: "string", required: true, description: "'validate' ou 'simulate'" },
      { name: "workflow_name", type: "string", required: false, description: "Nome do workflow" },
      { name: "steps", type: "array", required: true, description: "Array de { action, service, config }" },
    ],
    sampleRequest: { action: "simulate", workflow_name: "Lead Nurture", steps: [{ action: "trigger", service: "hubspot" }, { action: "send", service: "email" }, { action: "notify", service: "slack" }] },
    sampleResponse: { workflow_name: "Lead Nurture", steps_executed: [{ step: 1, action: "trigger", service: "hubspot", status: "simulated_success" }, { step: 2, action: "send", service: "email", status: "simulated_success" }, { step: 3, action: "notify", service: "slack", status: "simulated_success" }], total_time_ms: 45 },
  },
];

const ApiDocs = () => {
  const [activeEndpoint, setActiveEndpoint] = useState(endpoints[0].id);
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const current = endpoints.find((e) => e.id === activeEndpoint)!;

  const handleTest = async () => {
    if (!apiKey) {
      toast.error("Insira sua API key para testar");
      return;
    }
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);

    try {
      const body = requestBody ? JSON.parse(requestBody) : current.sampleRequest;
      const res = await fetch(`${SUPABASE_URL}${current.path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResponseStatus(res.status);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(JSON.stringify({ error: String(err) }, null, 2));
      setResponseStatus(500);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copiado!");
  };

  const curlExample = `curl -X POST \\
  ${SUPABASE_URL}${current.path} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '${JSON.stringify(current.sampleRequest, null, 2)}'`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            API Documentation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            XPEX <span className="text-primary">API Reference</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Documentação completa de todos os 5 Brains. Teste endpoints ao vivo com seu API key.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Endpoints</h3>
            {endpoints.map((ep) => {
              const Icon = ep.icon;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setActiveEndpoint(ep.id);
                    setResponse(null);
                    setRequestBody("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeEndpoint === ep.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{ep.name}</span>
                </button>
              );
            })}

            {/* API Key input */}
            <div className="pt-4 border-t border-border mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="xpx_..."
                className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <current.icon className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>{current.name}</CardTitle>
                    <CardDescription>{current.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{current.method}</Badge>
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">{current.path}</code>
                </div>
              </CardHeader>
            </Card>

            {/* Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parâmetros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {current.fields.map((f) => (
                    <div key={f.name} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-semibold text-foreground">{f.name}</code>
                          <Badge variant="outline" className="text-xs">{f.type}</Badge>
                          {f.required && <Badge className="text-xs bg-red-500/10 text-red-400 border-red-500/20">required</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="playground">
              <TabsList>
                <TabsTrigger value="playground">Playground</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="response">Sample Response</TabsTrigger>
              </TabsList>

              <TabsContent value="playground" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Request Body</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={requestBody || JSON.stringify(current.sampleRequest, null, 2)}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={8}
                      className="w-full font-mono text-sm p-4 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                    <Button onClick={handleTest} disabled={loading} className="mt-4 gap-2">
                      <Play className="w-4 h-4" />
                      {loading ? "Enviando..." : "Testar Endpoint"}
                    </Button>
                  </CardContent>
                </Card>

                {response && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {responseStatus && responseStatus < 300 ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <CardTitle className="text-lg">
                          Response {responseStatus && <Badge variant="outline">{responseStatus}</Badge>}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto max-h-96">{response}</pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="curl">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">cURL Example</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(curlExample)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto">{curlExample}</pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="response">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sample Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto">
                      {JSON.stringify(current.sampleResponse, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocs;
