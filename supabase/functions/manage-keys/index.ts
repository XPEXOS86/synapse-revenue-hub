import { corsHeaders, extractTraceHeaders, getSupabaseAdmin, logSystemEvent, structuredLog, traceResponseHeaders } from "../_shared/observability.ts";
import type { RequestContext } from "../_shared/observability.ts";

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
    functionName: "manage-keys",
    supabaseAdmin,
    startTime: Date.now(),
  };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: traceResponseHeaders(ctx),
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: traceResponseHeaders(ctx),
      });
    }

    ctx.actorUserId = user.id;
    const userId = user.id;
    const body = await req.json();
    const { action } = body;

    // Resolve tenant for context
    const { data: tenantData } = await supabaseAdmin
      .from("tenants").select("id").eq("owner_id", userId).limit(1).maybeSingle();
    ctx.tenantId = tenantData?.id || null;

    await logSystemEvent(ctx, `manage_keys_${action}_started`, "api", "started");

    if (action === "ensure-tenant") {
      const { data: existing } = await supabaseAdmin
        .from("tenants")
        .select("id, name, slug, plan, status")
        .eq("owner_id", userId)
        .limit(1)
        .maybeSingle();

      if (existing) {
        ctx.tenantId = existing.id;
        await logSystemEvent(ctx, "ensure_tenant_completed", "api", "completed");
        return new Response(JSON.stringify({ tenant: existing }), {
          headers: traceResponseHeaders(ctx),
        });
      }

      const slug = `tenant-${userId.substring(0, 8)}`;
      const { data: newTenant, error: tenantErr } = await supabaseAdmin
        .from("tenants")
        .insert({ name: "Minha Organização", slug, owner_id: userId, plan: "starter" })
        .select("id, name, slug, plan, status")
        .single();

      if (tenantErr) {
        await logSystemEvent(ctx, "ensure_tenant_failed", "api", "failed", { errorMessage: tenantErr.message });
        return new Response(JSON.stringify({ error: tenantErr.message }), {
          status: 500, headers: traceResponseHeaders(ctx),
        });
      }

      ctx.tenantId = newTenant!.id;

      const defaultAgents = [
        { name: "Billing Agent", role: "Gerencia planos, pay-per-use, upgrades e suspensões", brain: "all" },
        { name: "Monitor Agent", role: "Monitora performance, alertas, falhas e logs", brain: "all" },
        { name: "Marketing Agent", role: "Integração e automação de campanhas", brain: "all" },
        { name: "Integration Agent", role: "Conecta SaaS externos, Zapier e webhooks", brain: "all" },
        { name: "Brain Sync Agent", role: "Mantém Brains atualizados e replicáveis", brain: "gayson-core" },
        { name: "Automation Agent", role: "Otimiza fluxo interno, cross-sell e upsell automático", brain: "gayson-core" },
      ];

      await supabaseAdmin.from("agents").insert(
        defaultAgents.map((a) => ({
          tenant_id: newTenant!.id, name: a.name, role: a.role, brain: a.brain, status: "running",
        }))
      );

      await logSystemEvent(ctx, "ensure_tenant_completed", "api", "completed", {
        payload: { tenant_id: newTenant!.id, created: true },
      });

      return new Response(JSON.stringify({ tenant: newTenant, created: true }), {
        headers: traceResponseHeaders(ctx),
      });
    }

    if (action === "create-api-key") {
      const { name, brain } = body;

      if (!ctx.tenantId) {
        return new Response(JSON.stringify({ error: "No tenant found" }), {
          status: 400, headers: traceResponseHeaders(ctx),
        });
      }

      const rawKey = `xpx_${crypto.randomUUID().replace(/-/g, "")}`;
      const keyPrefix = rawKey.substring(0, 8);
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawKey));
      const keyHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const { data: apiKey, error: keyErr } = await supabaseAdmin
        .from("api_keys")
        .insert({
          tenant_id: ctx.tenantId,
          user_id: userId,
          name: name || "New Key",
          key_hash: keyHash,
          key_prefix: keyPrefix,
          brain: brain || "all",
        })
        .select("id, name, key_prefix, brain, rate_limit, is_active, created_at")
        .single();

      if (keyErr) {
        await logSystemEvent(ctx, "create_api_key_failed", "api", "failed", { errorMessage: keyErr.message });
        return new Response(JSON.stringify({ error: keyErr.message }), {
          status: 500, headers: traceResponseHeaders(ctx),
        });
      }

      await logSystemEvent(ctx, "create_api_key_completed", "api", "completed", {
        payload: { key_id: apiKey!.id },
      });

      return new Response(
        JSON.stringify({ api_key: { ...apiKey, raw_key: rawKey } }),
        { headers: traceResponseHeaders(ctx) }
      );
    }

    if (action === "delete-api-key") {
      const { keyId } = body;
      await supabaseAdmin
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId)
        .eq("user_id", userId);

      await logSystemEvent(ctx, "delete_api_key_completed", "api", "completed", {
        payload: { key_id: keyId },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: traceResponseHeaders(ctx),
      });
    }

    if (action === "list-api-keys") {
      if (!ctx.tenantId) {
        return new Response(JSON.stringify({ keys: [] }), {
          headers: traceResponseHeaders(ctx),
        });
      }

      const { data: keys } = await supabaseAdmin
        .from("api_keys")
        .select("id, name, key_prefix, brain, rate_limit, is_active, created_at, last_used_at")
        .eq("tenant_id", ctx.tenantId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      await logSystemEvent(ctx, "list_api_keys_completed", "api", "completed");

      return new Response(JSON.stringify({ keys: keys || [] }), {
        headers: traceResponseHeaders(ctx),
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: traceResponseHeaders(ctx),
    });
  } catch (err) {
    structuredLog("error", ctx, "manage-keys failed", { error: String(err) });
    await logSystemEvent(ctx, "manage_keys_failed", "api", "failed", { errorMessage: String(err) });
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500, headers: traceResponseHeaders(ctx),
    });
  }
});
