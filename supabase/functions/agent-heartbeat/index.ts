import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "pulse";

    if (action === "pulse") {
      // Update heartbeat for all running agents owned by this user
      const { data: tenants } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("owner_id", user.id);

      if (!tenants || tenants.length === 0) {
        return new Response(JSON.stringify({ error: "No tenant found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tenantIds = tenants.map((t) => t.id);
      const now = new Date().toISOString();

      // Update heartbeat and increment events for running agents
      const { data: updated, error } = await supabaseAdmin
        .from("agents")
        .update({ last_heartbeat: now, events_count: undefined })
        .in("tenant_id", tenantIds)
        .eq("status", "running")
        .select("id, name, status, last_heartbeat");

      // Use raw update with increment for events_count
      for (const tid of tenantIds) {
        await supabaseAdmin.rpc("increment_agent_events", { _tenant_id: tid }).catch(() => {});
      }

      // Also mark agents as "stale" if heartbeat > 5 min ago
      const staleThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from("agents")
        .update({ status: "stale" })
        .in("tenant_id", tenantIds)
        .eq("status", "running")
        .lt("last_heartbeat", staleThreshold);

      return new Response(
        JSON.stringify({ action: "pulse", agents_updated: updated?.length ?? 0, timestamp: now }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "status") {
      // Get all agents with computed health status
      const { data: tenants } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("owner_id", user.id);

      if (!tenants || tenants.length === 0) {
        return new Response(JSON.stringify({ agents: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tenantIds = tenants.map((t) => t.id);
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

      return new Response(JSON.stringify({ agents: enriched }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use 'pulse' or 'status'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
