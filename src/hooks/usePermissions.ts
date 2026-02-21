/**
 * usePermissions Hook
 * Provides permission checking functionality within components
 */

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import * as permissionService from '@/services/permissionService';
import * as roleService from '@/services/roleService';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissionUtils';
import type { PermissionName, UserRole, PermissionContext } from '@/types/permissions';

interface UsePermissionsResult {
  // Simple checks
  hasPermission: (permission: PermissionName) => boolean;
  hasAnyPermission: (permissions: PermissionName[]) => boolean;
  hasAllPermissions: (permissions: PermissionName[]) => boolean;

  // User info
  userRole: UserRole | null;
  userPermissions: PermissionName[];
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isGuest: boolean;

  // Team info
  teamId: string | null;
  canManageMembers: boolean;
  canManageRoles: boolean;
  canManagePermissions: boolean;
  canManageBilling: boolean;
  canViewAudit: boolean;

  // Loading states
  loading: boolean;
  error: Error | null;

  // Refresh
  refresh: () => Promise<void>;

  // Full context
  context: PermissionContext | null;
}

/**
 * Hook to check user permissions
 */
export function usePermissions(): UsePermissionsResult {
  const { user, currentTeam, teamMember } = useAuth();
  const [userPermissions, setUserPermissions] = useState<PermissionName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const userRole = (teamMember?.role as UserRole) || null;
  const teamId = currentTeam?.id || null;

  // Refresh permissions from database
  const refresh = useCallback(async () => {
    if (!user || !teamId) return;

    setLoading(true);
    setError(null);

    try {
      const permissions = await permissionService.getUserPermissions(user.id, teamId);
      setUserPermissions(permissions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error refreshing permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user, teamId]);

  // Load permissions on mount and when user/team changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Permission check functions using current user's role
  const checkPermission = useCallback(
    (permission: PermissionName): boolean => {
      if (!userRole) return false;
      return hasPermission(userRole, permission);
    },
    [userRole]
  );

  const checkAnyPermission = useCallback(
    (permissions: PermissionName[]): boolean => {
      if (!userRole) return false;
      return hasAnyPermission(userRole, permissions);
    },
    [userRole]
  );

  const checkAllPermissions = useCallback(
    (permissions: PermissionName[]): boolean => {
      if (!userRole) return false;
      return hasAllPermissions(userRole, permissions);
    },
    [userRole]
  );

  // Role checks
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;
  const isMember = userRole === 'member';
  const isGuest = userRole === 'guest';

  // Feature availability checks
  const canManageMembers = checkPermission('member.invite');
  const canManageRoles = checkPermission('role.assign');
  const canManagePermissions = checkPermission('permission.manage');
  const canManageBilling = checkPermission('billing.update');
  const canViewAudit = checkPermission('audit.view');

  // Create context object
  const context = useMemo<PermissionContext | null>(() => {
    if (!user || !userRole) return null;

    return {
      userId: user.id,
      role: userRole,
      teamId: teamId || '',
      permissions: userPermissions,
      isAdmin,
      isOwner,
      canManageMembers,
      canManageRoles,
      canManagePermissions,
      canViewAudit,
      canManageBilling,
    };
  }, [user, userRole, teamId, userPermissions, isAdmin, isOwner, canManageMembers, canManageRoles, canManagePermissions, canViewAudit, canManageBilling]);

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    userRole,
    userPermissions,
    isOwner,
    isAdmin,
    isMember,
    isGuest,
    teamId,
    canManageMembers,
    canManageRoles,
    canManagePermissions,
    canManageBilling,
    canViewAudit,
    loading,
    error,
    refresh,
    context,
  };
}
