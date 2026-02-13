import { useState, useCallback } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Copy, Play, CheckCircle, AlertCircle, Code, Terminal, Loader2, ShieldCheck, ShieldAlert, ShieldX, Trash2, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface SandboxResult {
  email: string;
  score: number;
  risk: string;
  checks: Record<string, boolean>;
  response_time_ms: number;
  timestamp: string;
}

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
];

const ApiDocs = () => {
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("sandbox");

  // Sandbox state
  const [sandboxEmail, setSandboxEmail] = useState("");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResults, setSandboxResults] = useState<SandboxResult[]>([]);
  const [sandboxLatest, setSandboxLatest] = useState<SandboxResult | null>(null);

  const current = endpoints[0];

  const handleSandboxTest = useCallback(async () => {
    if (!apiKey) {
      toast.error("Insira sua API key na sidebar para testar");
      return;
    }
    if (!sandboxEmail || !sandboxEmail.includes("@")) {
      toast.error("Insira um email válido para testar");
      return;
    }
    setSandboxLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/validate-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ email: sandboxEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao validar email");
        return;
      }
      const result: SandboxResult = {
        email: data.email,
        score: data.score,
        risk: data.risk,
        checks: data.checks,
        response_time_ms: data.response_time_ms,
        timestamp: new Date().toISOString(),
      };
      setSandboxLatest(result);
      setSandboxResults((prev) => [result, ...prev].slice(0, 20));
      toast.success(`Email validado: Score ${data.score}/100`);
    } catch (err) {
      toast.error("Erro de conexão");
    } finally {
      setSandboxLoading(false);
    }
  }, [apiKey, sandboxEmail]);

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

  const jsExample = `const response = await fetch(
  "${SUPABASE_URL}${current.path}",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "YOUR_API_KEY",
    },
    body: JSON.stringify(${JSON.stringify(current.sampleRequest, null, 4)}),
  }
);

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

response = requests.post(
    "${SUPABASE_URL}${current.path}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY",
    },
    json=${JSON.stringify(current.sampleRequest, null, 4)},
)

print(response.json())`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            API Documentation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Gold Mail Validator <span className="text-primary">API Reference</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Documentação completa com sandbox interativo. Teste a validação de emails ao vivo com seu API key.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Endpoint</h3>
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Email Validation</span>
            </div>

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
              <p className="text-xs text-muted-foreground mt-2">
                Gere sua key em <a href="/dashboard/keys" className="text-primary hover:underline">Dashboard → API Keys</a>
              </p>
            </div>

            {/* Quick info */}
            <div className="pt-4 border-t border-border mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Info</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Auth via header <code className="text-foreground">x-api-key</code></p>
                <p>• Rate limit: 1000 req/hora</p>
                <p>• Formato: JSON</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <CardTitle>{current.name}</CardTitle>
                    <CardDescription>{current.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{current.method}</Badge>
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded font-mono">{current.path}</code>
                  <Button variant="ghost" size="sm" className="ml-auto h-7" onClick={() => copyCode(`${SUPABASE_URL}${current.path}`)}>
                    <Copy className="w-3 h-3" />
                  </Button>
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

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="sandbox" className="gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Sandbox
                </TabsTrigger>
                <TabsTrigger value="playground" className="gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Playground
                </TabsTrigger>
                <TabsTrigger value="curl" className="gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> cURL
                </TabsTrigger>
                <TabsTrigger value="javascript" className="gap-1.5">
                  <Code className="w-3.5 h-3.5" /> JavaScript
                </TabsTrigger>
                <TabsTrigger value="python" className="gap-1.5">
                  <Code className="w-3.5 h-3.5" /> Python
                </TabsTrigger>
                <TabsTrigger value="response">Sample Response</TabsTrigger>
              </TabsList>

              {/* Interactive Sandbox */}
              <TabsContent value="sandbox" className="space-y-4">
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Email Validation Sandbox</CardTitle>
                    </div>
                    <CardDescription>Teste emails em tempo real e veja os resultados visuais instantaneamente.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Digite um email para validar..."
                        value={sandboxEmail}
                        onChange={(e) => setSandboxEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSandboxTest()}
                        className="flex-1 font-mono"
                      />
                      <Button onClick={handleSandboxTest} disabled={sandboxLoading} className="gap-2 min-w-[140px]">
                        {sandboxLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {sandboxLoading ? "Validando..." : "Validar"}
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {["ceo@google.com", "test@mailinator.com", "admin@localhost", "user@empresa.com.br"].map((sample) => (
                        <Button
                          key={sample}
                          variant="outline"
                          size="sm"
                          className="text-xs font-mono h-7"
                          onClick={() => { setSandboxEmail(sample); }}
                        >
                          {sample}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Latest Result */}
                {sandboxLatest && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                              <circle
                                cx="60" cy="60" r="52" fill="none"
                                stroke={sandboxLatest.score >= 80 ? "hsl(var(--primary))" : sandboxLatest.score >= 50 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)"}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${(sandboxLatest.score / 100) * 327} 327`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-bold">{sandboxLatest.score}</span>
                              <span className="text-xs text-muted-foreground">/ 100</span>
                            </div>
                          </div>
                          <Badge
                            className={`mt-3 gap-1 ${
                              sandboxLatest.risk === "low"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : sandboxLatest.risk === "medium"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {sandboxLatest.risk === "low" ? <ShieldCheck className="w-3 h-3" /> : sandboxLatest.risk === "medium" ? <ShieldAlert className="w-3 h-3" /> : <ShieldX className="w-3 h-3" />}
                            {sandboxLatest.risk === "low" ? "Baixo Risco" : sandboxLatest.risk === "medium" ? "Risco Médio" : "Alto Risco"}
                          </Badge>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <p className="font-mono text-sm text-muted-foreground mb-3">{sandboxLatest.email}</p>
                          {Object.entries(sandboxLatest.checks).map(([key, passed]) => (
                            <div key={key} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                              {passed ? (
                                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                              )}
                              <span className="text-sm font-medium">
                                {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {passed ? "PASS" : "FAIL"}
                              </Badge>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{sandboxLatest.response_time_ms}ms</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* History */}
                {sandboxResults.length > 1 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Histórico de Testes</CardTitle>
                        <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={() => { setSandboxResults([]); setSandboxLatest(null); }}>
                          <Trash2 className="w-3 h-3" /> Limpar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {sandboxResults.slice(1).map((r, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30 text-sm">
                            {r.risk === "low" ? <ShieldCheck className="w-4 h-4 text-primary" /> : r.risk === "medium" ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <ShieldX className="w-4 h-4 text-destructive" />}
                            <span className="font-mono flex-1 truncate">{r.email}</span>
                            <Badge variant="outline" className="text-xs">{r.score}/100</Badge>
                            <span className="text-xs text-muted-foreground">{r.response_time_ms}ms</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

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
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      {loading ? "Processando..." : "Testar Endpoint"}
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
                        <Button variant="ghost" size="sm" className="ml-auto h-7" onClick={() => copyCode(response)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto max-h-96 whitespace-pre-wrap">{response}</pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="curl">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">cURL</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(curlExample)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto whitespace-pre-wrap">{curlExample}</pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="javascript">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">JavaScript / TypeScript</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(jsExample)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto whitespace-pre-wrap">{jsExample}</pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="python">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Python</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(pythonExample)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto whitespace-pre-wrap">{pythonExample}</pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="response">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Sample Response</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(JSON.stringify(current.sampleResponse, null, 2))}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-sm p-4 rounded-lg bg-muted/50 overflow-auto whitespace-pre-wrap">
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
