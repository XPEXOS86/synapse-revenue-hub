import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function analyzeAd(data: Record<string, unknown>) {
  const spend = Number(data.spend) || 0;
  const impressions = Number(data.impressions) || 0;
  const clicks = Number(data.clicks) || 0;
  const conversions = Number(data.conversions) || 0;
  const revenue = Number(data.revenue) || 0;

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + "%" : "N/A";
  const cpc = clicks > 0 ? (spend / clicks).toFixed(2) : "N/A";
  const cpa = conversions > 0 ? (spend / conversions).toFixed(2) : "N/A";
  const roas = spend > 0 ? (revenue / spend).toFixed(2) : "N/A";
  const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) + "%" : "N/A";

  const suggestions: string[] = [];
  if (impressions > 0 && clicks / impressions < 0.01) suggestions.push("CTR < 1% – test new creatives and copy");
  if (spend > 0 && revenue / spend < 1) suggestions.push("ROAS < 1 – campaign is unprofitable, review targeting");
  if (clicks > 0 && conversions / clicks < 0.02) suggestions.push("CVR < 2% – optimize landing page or offer");
  if (Number(cpc) > 5) suggestions.push("CPC > $5 – consider broader targeting or lower bids");
  if (suggestions.length === 0) suggestions.push("Campaign metrics look strong!");

  const score = Math.min(100, Math.round(
    (impressions > 0 ? (clicks / impressions > 0.02 ? 25 : 10) : 0) +
    (spend > 0 ? (revenue / spend > 2 ? 25 : revenue / spend > 1 ? 15 : 5) : 0) +
    (clicks > 0 ? (conversions / clicks > 0.05 ? 25 : 10) : 0) +
    (conversions > 0 ? 25 : 0)
  ));

  return { ctr, cpc, cpa, roas, conversion_rate: conversionRate, performance_score: score, suggestions };
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

    if (keyData.brain !== "all" && keyData.brain !== "ad-optimization") {
      return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { spend, impressions, clicks, conversions, revenue, platform } = body;

    if (!spend && !impressions && !clicks) {
      return new Response(JSON.stringify({ error: "Provide ad data: spend, impressions, clicks, conversions, revenue" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = analyzeAd(body);
    const responseTime = Date.now() - startTime;

    await supabase.from("usage_logs").insert({
      tenant_id: keyData.tenant_id, api_key_id: keyData.id,
      endpoint: "/ad-optimization", brain: "ad-optimization",
      status_code: 200, response_time_ms: responseTime,
    });

    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);

    return new Response(
      JSON.stringify({ input: { spend, impressions, clicks, conversions, revenue, platform }, analysis, response_time_ms: responseTime }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
