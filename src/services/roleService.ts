/**
 * Role Management Service
 * Handles team member role management and role transitions
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/permissions';
import * as auditService from './auditService';
import { AuditActions } from './auditService';
import { isRoleHigherOrEqual } from '@/lib/permissions';

/**
 * Get a user's role in a team
 */
export async function getUserRoleInTeam(userId: string, teamId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return (data?.role as UserRole) || null;
}

/**
 * Update a user's role in a team
 */
export async function updateUserRoleInTeam(
  userId: string,
  teamId: string,
  newRole: UserRole,
  changedBy: string
): Promise<void> {
  // First get the current role
  const currentRole = await getUserRoleInTeam(userId, teamId);

  if (currentRole === newRole) {
    return; // No change needed
  }

  // Update the role
  const { error } = await supabase
    .from('team_members')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }

  // Log the role change
  await auditService.logAuditAction(
    teamId,
    changedBy,
    AuditActions.MEMBER_ROLE_CHANGED,
    'team_member',
    userId,
    {
      previous_role: currentRole,
      new_role: newRole,
    }
  );
}

/**
 * Check if a user can change another user's role
 */
export async function canChangeUserRole(
  userRole: UserRole,
  targetRole: UserRole
): Promise<boolean> {
  // User must have equal or higher role than target
  return isRoleHigherOrEqual(userRole, targetRole);
}

/**
 * Get all available roles for a user to assign to others
 */
export function getAvailableRolesToAssign(userRole: UserRole): UserRole[] {
  const ROLE_HIERARCHY: Record<UserRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    guest: 1,
  };

  const availableRoles: UserRole[] = [];
  const userHierarchy = ROLE_HIERARCHY[userRole];

  const allRoles: UserRole[] = ['owner', 'admin', 'member', 'guest'];

  for (const role of allRoles) {
    if (ROLE_HIERARCHY[role] <= userHierarchy) {
      availableRoles.push(role);
    }
  }

  return availableRoles;
}

/**
 * Get team members with their roles
 */
export async function getTeamMembersWithRoles(teamId: string): Promise<
  Array<{
    id: string;
    user_id: string;
    team_id: string;
    role: UserRole;
    joined_at: string;
    profile?: {
      email: string;
      username?: string;
      avatar_url?: string;
    };
  }>
> {
  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
      id,
      user_id,
      team_id,
      role,
      joined_at,
      user:profiles(
        email,
        username,
        avatar_url
      )
    `
    )
    .eq('team_id', teamId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }

  return (
    data?.map((member: any) => ({
      ...member,
      profile: member.user,
    })) || []
  );
}

/**
 * Get role statistics for a team
 */
export async function getRoleStatistics(
  teamId: string
): Promise<Record<UserRole, number>> {
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId);

  if (error) {
    console.error('Error fetching role statistics:', error);
    throw error;
  }

  const stats: Record<UserRole, number> = {
    owner: 0,
    admin: 0,
    member: 0,
    guest: 0,
  };

  data?.forEach((member) => {
    stats[member.role as UserRole]++;
  });

  return stats;
}

/**
 * Validate role transition
 */
export function validateRoleTransition(
  currentRole: UserRole,
  newRole: UserRole,
  userRole: UserRole
): { valid: boolean; reason?: string } {
  const ROLE_HIERARCHY: Record<UserRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    guest: 1,
  };

  // User must have higher or equal role than both current and new
  const userHierarchy = ROLE_HIERARCHY[userRole];
  const currentHierarchy = ROLE_HIERARCHY[currentRole];
  const newHierarchy = ROLE_HIERARCHY[newRole];

  if (userHierarchy < currentHierarchy) {
    return {
      valid: false,
      reason: 'Cannot change role of someone with higher privilege',
    };
  }

  if (userHierarchy < newHierarchy) {
    return {
      valid: false,
      reason: 'Cannot assign role with higher privilege than yourself',
    };
  }

  return { valid: true };
}

/**
 * Get role change history for a user
 */
export async function getUserRoleChangeHistory(
  userId: string,
  teamId: string,
  limit: number = 50
): Promise<any[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .eq('action', AuditActions.MEMBER_ROLE_CHANGED)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching role change history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Bulk update user roles
 */
export async function bulkUpdateUserRoles(
  teamId: string,
  updates: Array<{ userId: string; newRole: UserRole }>,
  changedBy: string
): Promise<void> {
  for (const update of updates) {
    try {
      await updateUserRoleInTeam(update.userId, teamId, update.newRole, changedBy);
    } catch (error) {
      console.error(`Error updating role for user ${update.userId}:`, error);
      throw error;
    }
  }
}

/**
 * Get the primary role count (for team composition analysis)
 */
export async function getTeamComposition(teamId: string): Promise<{
  total: number;
  byRole: Record<UserRole, { count: number; percentage: number }>;
}> {
  const stats = await getRoleStatistics(teamId);
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  const composition: Record<UserRole, { count: number; percentage: number }> = {
    owner: { count: stats.owner, percentage: total > 0 ? (stats.owner / total) * 100 : 0 },
    admin: { count: stats.admin, percentage: total > 0 ? (stats.admin / total) * 100 : 0 },
    member: { count: stats.member, percentage: total > 0 ? (stats.member / total) * 100 : 0 },
    guest: { count: stats.guest, percentage: total > 0 ? (stats.guest / total) * 100 : 0 },
  };

  return { total, byRole: composition };
}
