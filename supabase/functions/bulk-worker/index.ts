import { corsHeaders, getSupabaseAdmin, structuredLog } from "../_shared/observability.ts";
import type { RequestContext } from "../_shared/observability.ts";

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

const WORKER_ID = crypto.randomUUID();
const BATCH_SIZE = 100;
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 min stale lock

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = getSupabaseAdmin();
  const ctx: Partial<RequestContext> = {
    functionName: "bulk-worker",
    requestId: crypto.randomUUID(),
  };

  try {
    // Claim a pending job atomically
    const { data: job, error: lockError } = await supabase
      .from("bulk_jobs")
      .update({
        status: "processing",
        locked_at: new Date().toISOString(),
        worker_id: WORKER_ID,
        processing_started_at: new Date().toISOString(),
      })
      .eq("status", "pending")
      .is("locked_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .select("*")
      .maybeSingle();

    if (lockError) {
      structuredLog("error", ctx, "Failed to lock job", { error: lockError.message });
      return new Response(JSON.stringify({ status: "error", detail: lockError.message }), { status: 500 });
    }

    if (!job) {
      // Also check for stale locked jobs (lock expired)
      const staleThreshold = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString();
      const { data: staleJob } = await supabase
        .from("bulk_jobs")
        .update({
          status: "processing",
          locked_at: new Date().toISOString(),
          worker_id: WORKER_ID,
        })
        .eq("status", "processing")
        .lt("locked_at", staleThreshold)
        .order("created_at", { ascending: true })
        .limit(1)
        .select("*")
        .maybeSingle();

      if (!staleJob) {
        return new Response(JSON.stringify({ status: "idle", message: "No pending jobs" }), { status: 200 });
      }
      // Process the stale job
      return await processJob(supabase, staleJob, ctx);
    }

    return await processJob(supabase, job, ctx);
  } catch (err) {
    structuredLog("error", ctx, "Worker crashed", { error: String(err) });
    return new Response(JSON.stringify({ status: "error", detail: String(err) }), { status: 500 });
  }
});

async function processJob(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  job: Record<string, unknown>,
  ctx: Partial<RequestContext>
) {
  const jobId = job.id as string;
  const tenantId = job.tenant_id as string;
  let validCount = 0, invalidCount = 0, catchAllCount = 0, riskyCount = 0, processed = 0;

  structuredLog("info", ctx, `Processing job ${jobId}`);

  try {
    while (true) {
      const { data: inputs } = await supabase
        .from("bulk_inputs")
        .select("id, email")
        .eq("bulk_job_id", jobId)
        .eq("processed", false)
        .limit(BATCH_SIZE);

      if (!inputs || inputs.length === 0) break;

      const results = inputs.map((input: { id: string; email: string }) => {
        const result = scoreEmail(input.email);
        if (result.status === "valid") validCount++;
        else if (result.status === "invalid") invalidCount++;
        else if (result.status === "catch-all") catchAllCount++;
        else riskyCount++;
        return {
          tenant_id: tenantId,
          bulk_job_id: jobId,
          email: input.email,
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

      // Mark inputs as processed
      await supabase
        .from("bulk_inputs")
        .update({ processed: true })
        .in("id", inputs.map((i: { id: string }) => i.id));

      processed += inputs.length;

      // Update progress
      await supabase.from("bulk_jobs").update({
        processed,
        valid_count: validCount,
        invalid_count: invalidCount,
        catch_all_count: catchAllCount,
        risky_count: riskyCount,
        locked_at: new Date().toISOString(), // refresh lock
      }).eq("id", jobId);
    }

    // Mark completed
    await supabase.from("bulk_jobs").update({
      status: "completed",
      processed,
      valid_count: validCount,
      invalid_count: invalidCount,
      catch_all_count: catchAllCount,
      risky_count: riskyCount,
      processing_completed_at: new Date().toISOString(),
      locked_at: null,
      worker_id: null,
    }).eq("id", jobId);

    // Dispatch webhook if configured
    const webhookUrl = job.webhook_url as string | null;
    if (webhookUrl) {
      const summary = {
        job_id: jobId,
        status: "completed",
        total_emails: job.total_emails,
        valid: validCount,
        invalid: invalidCount,
        catch_all: catchAllCount,
        risky: riskyCount,
      };
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-worker-id": WORKER_ID,
          },
          body: JSON.stringify(summary),
        });
      } catch { /* silent */ }
    }

    structuredLog("info", ctx, `Job ${jobId} completed: ${processed} emails processed`);
    return new Response(JSON.stringify({
      status: "completed",
      job_id: jobId,
      processed,
      valid: validCount,
      invalid: invalidCount,
    }), { status: 200 });

  } catch (err) {
    // Mark job as failed
    await supabase.from("bulk_jobs").update({
      status: "failed",
      last_error: String(err),
      locked_at: null,
      worker_id: null,
    }).eq("id", jobId);

    structuredLog("error", ctx, `Job ${jobId} failed`, { error: String(err) });
    return new Response(JSON.stringify({ status: "failed", job_id: jobId, error: String(err) }), { status: 500 });
  }
}
