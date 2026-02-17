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
    functionName: "agent-heartbeat",
    supabaseAdmin,
    startTime: Date.now(),
  };

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: traceResponseHeaders(ctx),
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: traceResponseHeaders(ctx),
      });
    }

    ctx.actorUserId = user.id;
    const body = await req.json().catch(() => ({}));
    const action = body.action || "pulse";

    const { data: tenants } = await supabaseAdmin
      .from("tenants").select("id").eq("owner_id", user.id);

    if (!tenants || tenants.length === 0) {
      if (action === "status") {
        return new Response(JSON.stringify({ agents: [] }), {
          status: 200, headers: traceResponseHeaders(ctx),
        });
      }
      return new Response(JSON.stringify({ error: "No tenant found" }), {
        status: 404, headers: traceResponseHeaders(ctx),
      });
    }

    const tenantIds = tenants.map((t) => t.id);
    ctx.tenantId = tenantIds[0];

    await logSystemEvent(ctx, `heartbeat_${action}_started`, "agent", "started");

    if (action === "pulse") {
      const now = new Date().toISOString();
      const { data: runningAgents } = await supabaseAdmin
        .from("agents")
        .select("id, events_count")
        .in("tenant_id", tenantIds)
        .eq("status", "running");

      const updates = (runningAgents || []).map((a) =>
        supabaseAdmin
          .from("agents")
          .update({ last_heartbeat: now, events_count: (a.events_count || 0) + 1 })
          .eq("id", a.id)
      );
      await Promise.all(updates);

      await logSystemEvent(ctx, "heartbeat_pulse_completed", "agent", "completed", {
        payload: { agents_updated: runningAgents?.length ?? 0 },
      });

      return new Response(
        JSON.stringify({ action: "pulse", agents_updated: runningAgents?.length ?? 0, timestamp: now }),
        { status: 200, headers: traceResponseHeaders(ctx) }
      );
    }

    if (action === "status") {
      const { data: agents } = await supabaseAdmin
        .from("agents")
        .select("id, name, role, brain, status, events_count, last_heartbeat")
        .in("tenant_id", tenantIds)
        .order("created_at", { ascending: true });

      const now = Date.now();
      const enriched = (agents || []).map((a) => {
        const lastBeat = a.last_heartbeat ? new Date(a.last_heartbeat).getTime() : 0;
        const diffMs = now - lastBeat;
        let health = "unknown";
        if (a.status === "paused") health = "paused";
        else if (!a.last_heartbeat) health = "never_seen";
        else if (diffMs < 2 * 60 * 1000) health = "healthy";
        else if (diffMs < 5 * 60 * 1000) health = "warning";
        else health = "critical";
        return { ...a, health, last_heartbeat_ago_ms: diffMs };
      });

      await logSystemEvent(ctx, "heartbeat_status_completed", "agent", "completed", {
        payload: { agent_count: enriched.length },
      });

      return new Response(JSON.stringify({ agents: enriched }), {
        status: 200, headers: traceResponseHeaders(ctx),
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use 'pulse' or 'status'" }), {
      status: 400, headers: traceResponseHeaders(ctx),
    });
  } catch (err) {
    structuredLog("error", ctx, "agent-heartbeat failed", { error: String(err) });
    await logSystemEvent(ctx, "heartbeat_failed", "agent", "failed", { errorMessage: String(err) });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: traceResponseHeaders(ctx),
    });
  }
});
