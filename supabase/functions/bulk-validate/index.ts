import { corsHeaders, extractTraceHeaders, getSupabaseAdmin, logSystemEvent, structuredLog, traceResponseHeaders } from "../_shared/observability.ts";
import type { RequestContext } from "../_shared/observability.ts";

function validateEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseEmails(text: string): string[] {
  return text
    .split(/[\n\r,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"))
    .slice(0, 50000);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseAdmin();
  const { requestId, correlationId } = extractTraceHeaders(req);
  const ctx: RequestContext = {
    requestId,
    correlationId,
    tenantId: null,
    actorUserId: null,
    functionName: "bulk-validate",
    supabaseAdmin: supabase,
    startTime: Date.now(),
  };

  try {
    // --- Auth ---
    const apiKey = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");

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
          status: 403, headers: traceResponseHeaders(ctx),
        });
      }
      if (keyData.brain !== "all" && keyData.brain !== "email-validation") {
        return new Response(JSON.stringify({ error: "API key not authorized for this brain" }), {
          status: 403, headers: traceResponseHeaders(ctx),
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
          status: 401, headers: traceResponseHeaders(ctx),
        });
      }
      userId = user.id;
      const { data: tenant } = await supabase
        .from("tenants").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
      if (!tenant) {
        return new Response(JSON.stringify({ error: "No tenant found" }), {
          status: 403, headers: traceResponseHeaders(ctx),
        });
      }
      tenantId = tenant.id;
    } else {
      return new Response(JSON.stringify({ error: "Missing authentication" }), {
        status: 401, headers: traceResponseHeaders(ctx),
      });
    }

    ctx.tenantId = tenantId;
    ctx.actorUserId = userId;

    // --- GET: Check job progress ---
    const url = new URL(req.url);
    const jobId = url.searchParams.get("job_id");

    if (req.method === "GET" && jobId) {
      const { data: job } = await supabase
        .from("bulk_jobs").select("*").eq("id", jobId).eq("tenant_id", tenantId).maybeSingle();
      if (!job) {
        return new Response(JSON.stringify({ error: "Job not found" }), {
          status: 404, headers: traceResponseHeaders(ctx),
        });
      }
      return new Response(JSON.stringify(job), { status: 200, headers: traceResponseHeaders(ctx) });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: traceResponseHeaders(ctx),
      });
    }

    // --- POST: Create job + enqueue emails ---
    await logSystemEvent(ctx, "bulk_validation_queued", "api", "started");

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
          status: 400, headers: traceResponseHeaders(ctx),
        });
      }
      fileName = file.name;
      const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
      fileFormat = ext === ".txt" ? "txt" : ext === ".xlsx" ? "xlsx" : "csv";
      if (fileFormat === "xlsx") {
        return new Response(JSON.stringify({ error: "XLSX parsing not yet supported. Please use CSV or TXT." }), {
          status: 400, headers: traceResponseHeaders(ctx),
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
        status: 400, headers: traceResponseHeaders(ctx),
      });
    }

    // Create job with status=pending
    const { data: job, error: jobError } = await supabase
      .from("bulk_jobs")
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        file_name: fileName,
        file_format: fileFormat,
        total_emails: emails.length,
        status: "pending",
        webhook_url: webhookUrl,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (jobError || !job) {
      await logSystemEvent(ctx, "bulk_validation_failed", "api", "failed", { errorMessage: jobError?.message });
      return new Response(JSON.stringify({ error: "Failed to create bulk job", detail: jobError?.message }), {
        status: 500, headers: traceResponseHeaders(ctx),
      });
    }

    // Enqueue emails into bulk_inputs in batches of 500
    const INPUT_BATCH = 500;
    for (let i = 0; i < emails.length; i += INPUT_BATCH) {
      const batch = emails.slice(i, i + INPUT_BATCH).map((email) => ({
        tenant_id: tenantId!,
        bulk_job_id: job.id,
        email,
      }));
      await supabase.from("bulk_inputs").insert(batch);
    }

    // Log usage
    await supabase.from("usage_logs").insert({
      tenant_id: tenantId!,
      api_key_id: apiKeyId,
      endpoint: "/bulk-validate",
      brain: "email-validation",
      status_code: 202,
      response_time_ms: Date.now() - ctx.startTime,
      request_id: ctx.requestId,
    });

    structuredLog("info", ctx, `Bulk job queued: ${job.id}, ${emails.length} emails`);
    await logSystemEvent(ctx, "bulk_validation_queued", "api", "completed", {
      payload: { job_id: job.id, total_emails: emails.length } as unknown as Record<string, unknown>,
    });

    return new Response(JSON.stringify({
      job_id: job.id,
      status: "pending",
      total_emails: emails.length,
      message: "Job queued for processing",
    }), {
      status: 202,
      headers: traceResponseHeaders(ctx),
    });

  } catch (err) {
    structuredLog("error", ctx, "Bulk validation failed", { error: String(err) });
    await logSystemEvent(ctx, "bulk_validation_failed", "api", "failed", { errorMessage: String(err) });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: traceResponseHeaders(ctx),
    });
  }
});
