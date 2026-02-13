import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function enrichEmail(email: string) {
  const [local, domain] = email.split("@");
  const tld = domain?.split(".").pop() || "";
  const isBusinessEmail = !["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "live.com"].includes(domain?.toLowerCase() || "");

  return {
    local_part: local,
    domain,
    tld,
    is_business_email: isBusinessEmail,
    company_name: isBusinessEmail ? domain?.split(".")[0] || null : null,
    classification: isBusinessEmail ? "B2B" : "B2C",
  };
}

function enrichPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  const isBrazilian = cleaned.startsWith("55") || cleaned.length === 11 || cleaned.length === 10;
  return {
    raw: phone,
    cleaned,
    country_code: isBrazilian ? "BR" : "UNKNOWN",
    is_mobile: cleaned.length === 11 || (cleaned.startsWith("55") && cleaned.length === 13),
    is_valid_format: cleaned.length >= 10 && cleaned.length <= 15,
  };
}

function enrichDomain(domain: string) {
  const cleaned = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  return {
    domain: cleaned,
    tld: cleaned.split(".").pop() || "",
    is_corporate: !["gmail.com", "yahoo.com", "hotmail.com"].includes(cleaned),
    estimated_industry: null,
  };
}

function calculateIntentScore(data: Record<string, unknown>): number {
  let score = 50;
  if (data.email) score += 15;
  if (data.phone) score += 10;
  if (data.domain) score += 10;
  if (data.email && typeof data.email === "string" && !["gmail.com", "yahoo.com"].some(d => (data.email as string).includes(d))) score += 15;
  return Math.min(score, 100);
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: usageCount } = await supabase
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("api_key_id", keyData.id)
      .gte("created_at", oneHourAgo);

    if ((usageCount ?? 0) >= (keyData.rate_limit ?? 1000)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" },
      });
    }

    if (keyData.brain !== "all" && keyData.brain !== "data-enrichment") {
      return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, phone, domain } = body;

    if (!email && !phone && !domain) {
      return new Response(JSON.stringify({ error: "Provide at least one of: email, phone, domain" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const enriched: Record<string, unknown> = {};
    if (email) enriched.email_data = enrichEmail(email);
    if (phone) enriched.phone_data = enrichPhone(phone);
    if (domain) enriched.domain_data = enrichDomain(domain);

    enriched.intent_score = calculateIntentScore(body);
    enriched.icp_match = enriched.intent_score >= 70 ? "high" : enriched.intent_score >= 40 ? "medium" : "low";

    const responseTime = Date.now() - startTime;

    await supabase.from("usage_logs").insert({
      tenant_id: keyData.tenant_id,
      api_key_id: keyData.id,
      endpoint: "/enrich-data",
      brain: "data-enrichment",
      status_code: 200,
      response_time_ms: responseTime,
    });

    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);

    return new Response(
      JSON.stringify({ input: { email, phone, domain }, enriched, response_time_ms: responseTime }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
