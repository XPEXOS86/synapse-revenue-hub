import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function analyzeFunnel(data: Record<string, unknown>) {
  const visitors = Number(data.visitors) || 0;
  const leads = Number(data.leads) || 0;
  const trials = Number(data.trials) || 0;
  const customers = Number(data.customers) || 0;
  const revenue = Number(data.revenue) || 0;

  const conversionRates = {
    visitor_to_lead: visitors > 0 ? ((leads / visitors) * 100).toFixed(2) + "%" : "N/A",
    lead_to_trial: leads > 0 ? ((trials / leads) * 100).toFixed(2) + "%" : "N/A",
    trial_to_customer: trials > 0 ? ((customers / trials) * 100).toFixed(2) + "%" : "N/A",
    overall: visitors > 0 ? ((customers / visitors) * 100).toFixed(2) + "%" : "N/A",
  };

  const arpu = customers > 0 ? (revenue / customers).toFixed(2) : "0";
  const ltv_estimate = (Number(arpu) * 12).toFixed(2);

  const suggestions: string[] = [];
  if (leads / visitors < 0.05) suggestions.push("Optimize landing page – visitor-to-lead < 5%");
  if (trials / leads < 0.1) suggestions.push("Improve lead nurturing – lead-to-trial < 10%");
  if (customers / trials < 0.2) suggestions.push("Review onboarding – trial-to-customer < 20%");
  if (suggestions.length === 0) suggestions.push("Funnel looks healthy!");

  return { conversion_rates: conversionRates, arpu, ltv_estimate, suggestions };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const keyPrefix = apiKey.substring(0, 8);
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("id, tenant_id, brain, rate_limit, is_active")
      .eq("key_prefix", keyPrefix)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (keyData.brain !== "all" && keyData.brain !== "revenue-intelligence") {
      return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { visitors, leads, trials, customers, revenue } = body;

    if (!visitors && !leads && !customers) {
      return new Response(JSON.stringify({ error: "Provide funnel data: visitors, leads, trials, customers, revenue" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = analyzeFunnel(body);
    const responseTime = Date.now() - startTime;

    await supabase.from("usage_logs").insert({
      tenant_id: keyData.tenant_id, api_key_id: keyData.id,
      endpoint: "/revenue-intel", brain: "revenue-intelligence",
      status_code: 200, response_time_ms: responseTime,
    });

    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);

    return new Response(
      JSON.stringify({ input: { visitors, leads, trials, customers, revenue }, analysis, response_time_ms: responseTime }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
