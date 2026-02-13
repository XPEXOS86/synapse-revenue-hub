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

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const body = await req.json();
    const { action } = body;

    if (action === "ensure-tenant") {
      // Check if user already has a tenant
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

      // Create default tenant
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

      return new Response(JSON.stringify({ tenant: newTenant, created: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create-api-key") {
      const { name, brain } = body;

      // Get user's tenant
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

      // Generate API key
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

      // Return the raw key only on creation
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

    return new Response(JSON.stringify({ error: "Unknown action" }), {
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
