import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-api-key, x-request-id, x-correlation-id",
};

export interface RequestContext {
  requestId: string;
  correlationId: string;
  tenantId: string | null;
  actorUserId: string | null;
  functionName: string;
  supabaseAdmin: ReturnType<typeof createClient>;
  startTime: number;
}

export function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

export function extractTraceHeaders(req: Request): { requestId: string; correlationId: string } {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const correlationId = req.headers.get("x-correlation-id") || requestId;
  return { requestId, correlationId };
}

export function traceResponseHeaders(ctx: RequestContext): Record<string, string> {
  return {
    ...corsHeaders,
    "Content-Type": "application/json",
    "x-request-id": ctx.requestId,
    "x-correlation-id": ctx.correlationId,
  };
}

export async function logSystemEvent(
  ctx: RequestContext,
  eventType: string,
  source: "api" | "webhook" | "system" | "agent",
  status: "started" | "completed" | "failed",
  extra?: { errorMessage?: string; payload?: Record<string, unknown> }
) {
  if (!ctx.tenantId) return;
  try {
    await ctx.supabaseAdmin.from("system_events").insert({
      tenant_id: ctx.tenantId,
      event_type: eventType,
      source,
      request_id: ctx.requestId,
      correlation_id: ctx.correlationId,
      actor_user_id: ctx.actorUserId,
      function_name: ctx.functionName,
      status,
      error_message: extra?.errorMessage || null,
      payload: extra?.payload || {},
    });
  } catch (e) {
    console.error("[observability] Failed to log system event:", e);
  }
}

export function structuredLog(
  level: "info" | "warn" | "error",
  ctx: Partial<RequestContext>,
  message: string,
  extra?: Record<string, unknown>
) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    function_name: ctx.functionName,
    request_id: ctx.requestId,
    correlation_id: ctx.correlationId,
    tenant_id: ctx.tenantId,
    actor_user_id: ctx.actorUserId,
    ...extra,
  };
  if (level === "error") console.error(JSON.stringify(log));
  else if (level === "warn") console.warn(JSON.stringify(log));
  else console.log(JSON.stringify(log));
}
