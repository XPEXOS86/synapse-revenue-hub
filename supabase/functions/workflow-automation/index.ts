import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WorkflowStep {
  action: string;
  service: string;
  config?: Record<string, unknown>;
}

function validateWorkflow(steps: WorkflowStep[]) {
  const errors: string[] = [];
  const supportedServices = ["zapier", "hubspot", "stripe", "email", "webhook", "slack", "sheets"];
  const supportedActions = ["trigger", "filter", "transform", "send", "create", "update", "delete", "notify"];

  steps.forEach((step, i) => {
    if (!step.action) errors.push(`Step ${i + 1}: missing action`);
    if (!step.service) errors.push(`Step ${i + 1}: missing service`);
    if (step.service && !supportedServices.includes(step.service.toLowerCase())) {
      errors.push(`Step ${i + 1}: unsupported service "${step.service}". Supported: ${supportedServices.join(", ")}`);
    }
    if (step.action && !supportedActions.includes(step.action.toLowerCase())) {
      errors.push(`Step ${i + 1}: unsupported action "${step.action}". Supported: ${supportedActions.join(", ")}`);
    }
  });

  return errors;
}

function simulateWorkflow(steps: WorkflowStep[]) {
  return steps.map((step, i) => ({
    step: i + 1,
    action: step.action,
    service: step.service,
    status: "simulated_success",
    execution_time_ms: Math.floor(Math.random() * 200) + 50,
    output: { message: `${step.action} on ${step.service} completed` },
  }));
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

    // Rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: usageCount } = await supabase
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("api_key_id", keyData.id)
      .gte("created_at", oneHourAgo);

    if ((usageCount ?? 0) >= (keyData.rate_limit ?? 1000)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" },
      });
    }

    if (keyData.brain !== "all" && keyData.brain !== "workflow-automation") {
      return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action: wfAction, workflow_name, steps } = body;

    if (wfAction === "validate") {
      if (!steps || !Array.isArray(steps)) {
        return new Response(JSON.stringify({ error: "Provide 'steps' array" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errors = validateWorkflow(steps);
      return new Response(JSON.stringify({ valid: errors.length === 0, errors, steps_count: steps.length }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (wfAction === "simulate") {
      if (!steps || !Array.isArray(steps)) {
        return new Response(JSON.stringify({ error: "Provide 'steps' array" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const errors = validateWorkflow(steps);
      if (errors.length > 0) {
        return new Response(JSON.stringify({ error: "Invalid workflow", validation_errors: errors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = simulateWorkflow(steps);
      const responseTime = Date.now() - startTime;

      await supabase.from("usage_logs").insert({
        tenant_id: keyData.tenant_id, api_key_id: keyData.id,
        endpoint: "/workflow-automation", brain: "workflow-automation",
        status_code: 200, response_time_ms: responseTime,
      });

      await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id);

      return new Response(
        JSON.stringify({ workflow_name: workflow_name || "Unnamed", steps_executed: results, total_time_ms: responseTime }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use 'validate' or 'simulate'" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
