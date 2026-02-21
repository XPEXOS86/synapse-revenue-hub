/**
 * Permission Service
 * Handles permission queries and validation
 */

import { supabase } from '@/integrations/supabase/client';
import type { Permission, RolePermission, UserRole, PermissionName } from '@/types/permissions';
import { ROLE_PERMISSIONS, roleHasPermission } from '@/lib/permissions';

/**
 * Get all permissions from database
 */
export async function getAllPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('category, name');

  if (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(role: UserRole): Promise<Permission[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permission:permissions(*)')
    .eq('role', role);

  if (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }

  return data?.map((rp: any) => rp.permission).filter(Boolean) || [];
}

/**
 * Get all role permission mappings
 */
export async function getAllRolePermissions(): Promise<RolePermission[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*')
    .order('role, created_at');

  if (error) {
    console.error('Error fetching all role permissions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get role permission mappings with permission details
 */
export async function getRolePermissionsWithDetails(role: UserRole): Promise<RolePermission[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('*, permission:permissions(*)')
    .eq('role', role);

  if (error) {
    console.error('Error fetching role permission details:', error);
    throw error;
  }

  return data || [];
}

/**
 * Check if a role has a specific permission in the database
 */
export async function roleHasPermissionInDb(
  role: UserRole,
  permissionName: PermissionName
): Promise<boolean> {
  // First, check in-memory (faster)
  if (roleHasPermission(role, permissionName)) {
    return true;
  }

  // If not found in memory, query database as fallback
  const { data, error } = await supabase
    .from('role_permissions')
    .select('id')
    .eq('role', role)
    .eq('permission:permissions(name)', permissionName)
    .limit(1);

  if (error) {
    console.error('Error checking role permission:', error);
    throw error;
  }

  return (data && data.length > 0) || false;
}

/**
 * Get permissions for a user based on their role
 */
export async function getUserPermissions(
  userId: string,
  teamId: string
): Promise<PermissionName[]> {
  // Get user's role in the team
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .single();

  if (memberError || !memberData) {
    console.error('Error fetching user team role:', memberError);
    return [];
  }

  const role = memberData.role as UserRole;

  // Get permissions for this role
  const { data: permData, error: permError } = await supabase
    .from('role_permissions')
    .select('permission:permissions(name)')
    .eq('role', role);

  if (permError) {
    console.error('Error fetching user permissions:', permError);
    return [];
  }

  return (
    permData?.map((rp: any) => rp.permission?.name).filter(Boolean) || []
  );
}

/**
 * Check if user has a specific permission in a team
 */
export async function userHasPermissionInTeam(
  userId: string,
  teamId: string,
  permission: PermissionName
): Promise<boolean> {
  // Get user's role in the team
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .single();

  if (memberError || !memberData) {
    return false;
  }

  const role = memberData.role as UserRole;

  // Check if role has the permission
  return roleHasPermission(role, permission);
}

/**
 * Grant a permission to a role (admin only)
 */
export async function grantPermissionToRole(
  role: UserRole,
  permissionName: PermissionName,
  grantedBy: string
): Promise<RolePermission> {
  // First get the permission ID
  const { data: permData, error: permError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (permError || !permData) {
    throw new Error(`Permission not found: ${permissionName}`);
  }

  // Insert the role permission
  const { data, error } = await supabase
    .from('role_permissions')
    .insert({
      role,
      permission_id: permData.id,
      granted_by: grantedBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error granting permission to role:', error);
    throw error;
  }

  return data;
}

/**
 * Revoke a permission from a role (admin only)
 */
export async function revokePermissionFromRole(
  role: UserRole,
  permissionName: PermissionName
): Promise<void> {
  // First get the permission ID
  const { data: permData, error: permError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (permError || !permData) {
    throw new Error(`Permission not found: ${permissionName}`);
  }

  // Delete the role permission
  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role', role)
    .eq('permission_id', permData.id);

  if (error) {
    console.error('Error revoking permission from role:', error);
    throw error;
  }
}

/**
 * Sync role permissions from database with in-memory cache
 * Useful when permissions are updated outside the current session
 */
export async function syncRolePermissions(): Promise<Record<UserRole, PermissionName[]>> {
  const roles: UserRole[] = ['owner', 'admin', 'member', 'guest'];
  const syncedPermissions: Record<UserRole, PermissionName[]> = {} as Record<
    UserRole,
    PermissionName[]
  >;

  for (const role of roles) {
    const permissions = await getRolePermissions(role);
    syncedPermissions[role] = permissions.map((p) => p.name as PermissionName);
  }

  return syncedPermissions;
}

/**
 * Get permission change history for auditing
 */
export async function getPermissionChangeHistory(
  teamId: string,
  limit: number = 100
): Promise<any[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('team_id', teamId)
    .in('action', [
      'PERMISSION_GRANTED',
      'PERMISSION_REVOKED',
      'ROLE_PERMISSION_UPDATED',
    ])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching permission change history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Validate permission assignment based on role hierarchy
 */
export function validatePermissionAssignment(
  userRole: UserRole,
  targetRole: UserRole,
  permission: PermissionName
): { valid: boolean; reason?: string } {
  const ROLE_HIERARCHY: Record<UserRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    guest: 1,
  };

  // User must have higher or equal role
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[targetRole]) {
    return {
      valid: false,
      reason: 'Cannot assign permissions to higher role',
    };
  }

  // Check if target role should have this permission
  const targetPermissions = ROLE_PERMISSIONS[targetRole] || [];
  if (!targetPermissions.includes(permission)) {
    return {
      valid: false,
      reason: `Role ${targetRole} should not have permission ${permission}`,
    };
  }

  return { valid: true };
}
