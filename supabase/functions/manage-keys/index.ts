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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const body = await req.json();
    const { action } = body;

    if (action === "ensure-tenant") {
      const { data: existing } = await supabaseAdmin
        .from("tenants")
        .select("id, name, slug, plan, status")
        .eq("owner_id", userId)
        .limit(1)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ tenant: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const slug = `tenant-${userId.substring(0, 8)}`;
      const { data: newTenant, error: tenantErr } = await supabaseAdmin
        .from("tenants")
        .insert({ name: "Minha Organização", slug, owner_id: userId, plan: "starter" })
        .select("id, name, slug, plan, status")
        .single();

      if (tenantErr) {
        return new Response(JSON.stringify({ error: tenantErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
          tenant_id: newTenant!.id,
          name: a.name,
          role: a.role,
          brain: a.brain,
          status: "running",
        }))
      );

      return new Response(JSON.stringify({ tenant: newTenant, created: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create-api-key") {
      const { name, brain } = body;

      const { data: tenant } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("owner_id", userId)
        .limit(1)
        .single();

      if (!tenant) {
        return new Response(JSON.stringify({ error: "No tenant found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          tenant_id: tenant.id,
          user_id: userId,
          name: name || "New Key",
          key_hash: keyHash,
          key_prefix: keyPrefix,
          brain: brain || "all",
        })
        .select("id, name, key_prefix, brain, rate_limit, is_active, created_at")
        .single();

      if (keyErr) {
        return new Response(JSON.stringify({ error: keyErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ api_key: { ...apiKey, raw_key: rawKey } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete-api-key") {
      const { keyId } = body;
      await supabaseAdmin
        .from("api_keys")
        .update({ is_active: false })
        .eq("id", keyId)
        .eq("user_id", userId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list-api-keys") {
      const { data: tenant } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("owner_id", userId)
        .limit(1)
        .single();

      if (!tenant) {
        return new Response(JSON.stringify({ keys: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: keys } = await supabaseAdmin
        .from("api_keys")
        .select("id, name, key_prefix, brain, rate_limit, is_active, created_at, last_used_at")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({ keys: keys || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
