import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Log action to audit trail
export async function logAuditAction(
  teamId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, unknown>
): Promise<AuditLog> {
  const ipAddress = await getClientIpAddress();
  const userAgent = navigator.userAgent;

  const { data: log, error } = await supabase
    .from("audit_logs")
    .insert({
      team_id: teamId,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      changes: changes || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to log audit action: ${error.message}`);

  return log;
}

// Get team audit logs
export async function getTeamAuditLogs(
  teamId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ logs: AuditLog[]; total: number }> {
  let query = supabase.from("audit_logs").select("*", { count: "exact" }).eq("team_id", teamId);

  // Apply filters
  if (options?.action) {
    query = query.eq("action", options.action);
  }

  if (options?.resourceType) {
    query = query.eq("resource_type", options.resourceType);
  }

  if (options?.startDate) {
    query = query.gte("created_at", options.startDate);
  }

  if (options?.endDate) {
    query = query.lte("created_at", options.endDate);
  }

  // Apply pagination
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: logs, error, count } = await query;

  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);

  return {
    logs: logs || [],
    total: count || 0,
  };
}

// Get audit log by ID
export async function getAuditLog(logId: string): Promise<AuditLog> {
  const { data: log, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("id", logId)
    .single();

  if (error) throw new Error(`Failed to fetch audit log: ${error.message}`);

  return log;
}

// Get user activity
export async function getUserActivity(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ logs: AuditLog[]; total: number }> {
  let query = supabase.from("audit_logs").select("*", { count: "exact" }).eq("user_id", userId);

  if (options?.startDate) {
    query = query.gte("created_at", options.startDate);
  }

  if (options?.endDate) {
    query = query.lte("created_at", options.endDate);
  }

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: logs, error, count } = await query;

  if (error) throw new Error(`Failed to fetch user activity: ${error.message}`);

  return {
    logs: logs || [],
    total: count || 0,
  };
}

// Get team member activity
export async function getTeamMemberActivity(
  teamId: string,
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ logs: AuditLog[]; total: number }> {
  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .eq("team_id", teamId)
    .eq("user_id", userId);

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: logs, error, count } = await query;

  if (error) throw new Error(`Failed to fetch team member activity: ${error.message}`);

  return {
    logs: logs || [],
    total: count || 0,
  };
}

// Common audit actions
export const AuditActions = {
  // Team actions
  TEAM_CREATED: "team.created",
  TEAM_UPDATED: "team.updated",
  TEAM_DELETED: "team.deleted",

  // Member actions
  MEMBER_INVITED: "member.invited",
  MEMBER_ADDED: "member.added",
  MEMBER_ROLE_CHANGED: "member.role_changed",
  MEMBER_REMOVED: "member.removed",

  // Auth actions
  USER_SIGNED_UP: "auth.signed_up",
  USER_SIGNED_IN: "auth.signed_in",
  USER_SIGNED_OUT: "auth.signed_out",
  USER_PROFILE_UPDATED: "auth.profile_updated",

  // Invitation actions
  INVITATION_SENT: "invitation.sent",
  INVITATION_ACCEPTED: "invitation.accepted",
  INVITATION_DECLINED: "invitation.declined",
  INVITATION_CANCELLED: "invitation.cancelled",
} as const;

// Helper function to get client IP address
// Note: This is a best-effort approach and may not work in all environments
async function getClientIpAddress(): Promise<string | null> {
  try {
    // Try to get IP from the server using a lightweight API
    const response = await fetch("https://api.ipify.org?format=json");
    if (response.ok) {
      const data = (await response.json()) as { ip: string };
      return data.ip;
    }
  } catch (error) {
    console.warn("Failed to fetch client IP address:", error);
  }
  return null;
}
