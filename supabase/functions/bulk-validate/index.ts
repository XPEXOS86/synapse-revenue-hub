import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-api-key",
};

function validateEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const disposableDomains = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "maildrop.cc", "10minutemail.com", "trashmail.com",
]);

const roleAddresses = new Set([
  "admin", "info", "support", "noreply", "no-reply", "postmaster", "webmaster",
]);

function scoreEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const local = email.split("@")[0]?.toLowerCase() || "";
  const checks = {
    valid_format: validateEmailFormat(email),
    has_mx_likely: !["example.com", "test.com", "localhost"].includes(domain),
    not_disposable: !disposableDomains.has(domain),
    not_role_based: !roleAddresses.has(local),
    domain_length_ok: domain.length >= 4 && domain.length <= 255,
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / Object.keys(checks).length) * 100);
  const risk = score >= 80 ? "low" : score >= 50 ? "medium" : "high";

  const status = !checks.valid_format ? "invalid"
    : !checks.not_disposable ? "temporary"
    : !checks.has_mx_likely ? "invalid"
    : risk === "high" ? "risky"
    : risk === "medium" ? "catch-all"
    : "valid";

  return { score, risk, status, checks, disposable: !checks.not_disposable, role_based: !checks.not_role_based };
}

function parseEmails(text: string): string[] {
  return text
    .split(/[\n\r,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"))
    .slice(0, 50000); // safety cap
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth via API key or JWT
    const apiKey = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let tenantId: string | null = null;
    let userId: string | null = null;
    let apiKeyId: string | null = null;

    if (apiKey) {
      const keyPrefix = apiKey.substring(0, 8);
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("id, tenant_id, user_id, brain, rate_limit, is_active")
        .eq("key_prefix", keyPrefix)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!keyData) {
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (keyData.brain !== "all" && keyData.brain !== "email-validation") {
        return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      tenantId = keyData.tenant_id;
      userId = keyData.user_id;
      apiKeyId = keyData.id;
    } else if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = user.id;

      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!tenant) {
        return new Response(JSON.stringify({ error: "No tenant found" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      tenantId = tenant.id;
    } else {
      return new Response(JSON.stringify({ error: "Missing authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get("job_id");

    // GET: Check progress of existing job
    if (req.method === "GET" && jobId) {
      const { data: job } = await supabase
        .from("bulk_jobs")
        .select("*")
        .eq("id", jobId)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (!job) {
        return new Response(JSON.stringify({ error: "Job not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(job), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Create new bulk job
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get("content-type") || "";
    let emails: string[] = [];
    let fileName = "upload.csv";
    let fileFormat = "csv";
    let webhookUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      webhookUrl = formData.get("webhook_url") as string | null;

      if (!file) {
        return new Response(JSON.stringify({ error: "Missing 'file' in form data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      fileName = file.name;
      const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
      fileFormat = ext === ".txt" ? "txt" : ext === ".xlsx" ? "xlsx" : "csv";

      if (fileFormat === "xlsx") {
        return new Response(JSON.stringify({ error: "XLSX parsing not yet supported. Please use CSV or TXT." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const text = await file.text();
      emails = parseEmails(text);
    } else {
      const body = await req.json();
      if (Array.isArray(body.emails)) {
        emails = body.emails.map((e: string) => e.trim().toLowerCase()).filter((e: string) => e.includes("@"));
      } else if (typeof body.text === "string") {
        emails = parseEmails(body.text);
      }
      webhookUrl = body.webhook_url || null;
      fileName = body.file_name || "api-upload.csv";
      fileFormat = "csv";
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: "No valid emails found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create bulk job
    const { data: job, error: jobError } = await supabase
      .from("bulk_jobs")
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        file_name: fileName,
        file_format: fileFormat,
        total_emails: emails.length,
        status: "processing",
        webhook_url: webhookUrl,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Failed to create bulk job", detail: jobError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process emails in batches
    const BATCH_SIZE = 100;
    let validCount = 0;
    let invalidCount = 0;
    let catchAllCount = 0;
    let riskyCount = 0;
    let processed = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const results = batch.map((email) => {
        const result = scoreEmail(email);
        if (result.status === "valid") validCount++;
        else if (result.status === "invalid") invalidCount++;
        else if (result.status === "catch-all") catchAllCount++;
        else riskyCount++;

        return {
          tenant_id: tenantId!,
          bulk_job_id: job.id,
          api_key_id: apiKeyId,
          email,
          status: result.status,
          score: result.score,
          mx_check: result.checks.has_mx_likely,
          smtp_check: false,
          disposable: result.disposable,
          role_based: result.role_based,
          free_provider: false,
          domain_reputation: result.risk as "low" | "medium" | "high",
          checks: result.checks,
        };
      });

      await supabase.from("validation_results").insert(results);
      processed += batch.length;

      // Update progress
      await supabase
        .from("bulk_jobs")
        .update({
          processed,
          valid_count: validCount,
          invalid_count: invalidCount,
          catch_all_count: catchAllCount,
          risky_count: riskyCount,
        })
        .eq("id", job.id);
    }

    // Mark completed
    await supabase
      .from("bulk_jobs")
      .update({
        status: "completed",
        processed,
        valid_count: validCount,
        invalid_count: invalidCount,
        catch_all_count: catchAllCount,
        risky_count: riskyCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // Log usage
    await supabase.from("usage_logs").insert({
      tenant_id: tenantId!,
      api_key_id: apiKeyId,
      endpoint: "/bulk-validate",
      brain: "email-validation",
      status_code: 200,
      response_time_ms: 0,
    });

    const summary = {
      job_id: job.id,
      status: "completed",
      total_emails: emails.length,
      valid: validCount,
      invalid: invalidCount,
      catch_all: catchAllCount,
      risky: riskyCount,
      average_score: Math.round(
        emails.reduce((sum, e) => sum + scoreEmail(e).score, 0) / emails.length
      ),
    };

    // Webhook callback if configured
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(summary),
        });
      } catch {
        // silent fail for webhook
      }
    }

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
