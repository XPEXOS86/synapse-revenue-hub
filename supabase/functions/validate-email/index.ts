import { corsHeaders, extractTraceHeaders, getSupabaseAdmin, logSystemEvent, structuredLog, traceResponseHeaders } from "../_shared/observability.ts";
import type { RequestContext } from "../_shared/observability.ts";

function validateEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDisposableDomains(): string[] {
  return [
    "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
    "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
    "dispostable.com", "maildrop.cc", "10minutemail.com", "trashmail.com",
  ];
}

function scoreEmail(email: string) {
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

  const supabaseAdmin = getSupabaseAdmin();
  const { requestId, correlationId } = extractTraceHeaders(req);
  const ctx: RequestContext = {
    requestId,
    correlationId,
    tenantId: null,
    actorUserId: null,
    functionName: "validate-email",
    supabaseAdmin,
    startTime: Date.now(),
  };

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
        status: 401,
        headers: traceResponseHeaders(ctx),
      });
    }

    const keyPrefix = apiKey.substring(0, 8);
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("id, tenant_id, brain, rate_limit, is_active")
      .eq("key_prefix", keyPrefix)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 403,
        headers: traceResponseHeaders(ctx),
      });
    }

    ctx.tenantId = keyData.tenant_id;

    // Log started
    await logSystemEvent(ctx, "email_validation_started", "api", "started");

    // Rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: usageCount } = await supabaseAdmin
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("api_key_id", keyData.id)
      .gte("created_at", oneHourAgo);

    if ((usageCount ?? 0) >= (keyData.rate_limit ?? 1000)) {
      await logSystemEvent(ctx, "email_validation_rate_limited", "api", "failed", { errorMessage: "Rate limit exceeded" });
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429,
        headers: { ...traceResponseHeaders(ctx), "Retry-After": "3600" },
      });
    }

    if (keyData.brain !== "all" && keyData.brain !== "email-validation") {
      await logSystemEvent(ctx, "email_validation_unauthorized", "api", "failed", { errorMessage: "Brain not authorized" });
      return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
        status: 403,
        headers: traceResponseHeaders(ctx),
      });
    }

    const body = await req.json();
    const email = body.email;

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'email' field" }), {
        status: 400,
        headers: traceResponseHeaders(ctx),
      });
    }

    const result = scoreEmail(email);
    const responseTime = Date.now() - ctx.startTime;

    // Log usage with request_id
    await supabaseAdmin.from("usage_logs").insert({
      tenant_id: keyData.tenant_id,
      api_key_id: keyData.id,
      endpoint: "/validate-email",
      brain: "email-validation",
      status_code: 200,
      response_time_ms: responseTime,
      request_id: ctx.requestId,
    });

    await supabaseAdmin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);

    // Log completed
    await logSystemEvent(ctx, "email_validation_completed", "api", "completed", {
      payload: { email, score: result.score, risk: result.risk },
    });

    structuredLog("info", ctx, "Email validation completed", { email, score: result.score });

    return new Response(
      JSON.stringify({ email, ...result, response_time_ms: responseTime }),
      { status: 200, headers: traceResponseHeaders(ctx) }
    );
  } catch (err) {
    structuredLog("error", ctx, "Email validation failed", { error: String(err) });
    await logSystemEvent(ctx, "email_validation_failed", "api", "failed", { errorMessage: String(err) });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: traceResponseHeaders(ctx),
    });
  }
});
