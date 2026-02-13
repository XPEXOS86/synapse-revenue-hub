import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function validateEmailFormat(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function getDisposableDomains(): string[] {
  return [
    "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
    "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
    "dispostable.com", "maildrop.cc", "10minutemail.com", "trashmail.com",
  ];
}

function scoreEmail(email: string): { score: number; risk: string; checks: Record<string, boolean> } {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const checks = {
    valid_format: validateEmailFormat(email),
    has_mx_likely: !["example.com", "test.com", "localhost"].includes(domain),
    not_disposable: !getDisposableDomains().includes(domain),
    not_role_based: !["admin", "info", "support", "noreply", "no-reply", "postmaster", "webmaster"].includes(
      email.split("@")[0]?.toLowerCase() || ""
    ),
    domain_length_ok: domain.length >= 4 && domain.length <= 255,
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / Object.keys(checks).length) * 100);
  const risk = score >= 80 ? "low" : score >= 50 ? "medium" : "high";

  return { score, risk, checks };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Authenticate via API key header
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

    // Validate API key
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

    // Rate limiting: count requests in last hour
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

    // Check brain access
    if (keyData.brain !== "all" && keyData.brain !== "email-validation") {
      return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const email = body.email;

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'email' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = scoreEmail(email);
    const responseTime = Date.now() - startTime;

    // Log usage
    await supabase.from("usage_logs").insert({
      tenant_id: keyData.tenant_id,
      api_key_id: keyData.id,
      endpoint: "/validate-email",
      brain: "email-validation",
      status_code: 200,
      response_time_ms: responseTime,
    });

    // Update last used
    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);

    return new Response(
      JSON.stringify({
        email,
        ...result,
        response_time_ms: responseTime,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
