/**
 * useRoleManagement Hook
 * Provides role management functionality
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import * as roleService from '@/services/roleService';
import { getAvailableRolesToAssign } from '@/lib/permissions';
import type { UserRole } from '@/types/permissions';

interface TeamMemberWithRole {
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
}

interface UseRoleManagementResult {
  // Team members
  members: TeamMemberWithRole[];
  loading: boolean;
  error: Error | null;

  // Role operations
  updateMemberRole: (memberId: string, newRole: UserRole) => Promise<void>;
  canUpdateRole: (targetRole: UserRole) => boolean;
  availableRoles: UserRole[];

  // Role validation
  validateRoleTransition: (
    currentRole: UserRole,
    newRole: UserRole
  ) => { valid: boolean; reason?: string };

  // Role statistics
  getRoleStats: () => Promise<Record<UserRole, number>>;
  getTeamComposition: () => Promise<{
    total: number;
    byRole: Record<UserRole, { count: number; percentage: number }>;
  }>;

  // Refresh
  refresh: () => Promise<void>;
}

/**
 * Hook for managing team member roles
 */
export function useRoleManagement(): UseRoleManagementResult {
  const { user, currentTeam, teamMember } = useAuth();
  const { userRole, canManageRoles } = usePermissions();

  const [members, setMembers] = useState<TeamMemberWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load team members
  const loadMembers = useCallback(async () => {
    if (!currentTeam) return;

    setLoading(true);
    setError(null);

    try {
      const teamMembers = await roleService.getTeamMembersWithRoles(currentTeam.id);
      setMembers(teamMembers);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTeam]);

  // Load members on mount and when team changes
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Update member role
  const updateMemberRole = useCallback(
    async (memberId: string, newRole: UserRole) => {
      if (!user || !currentTeam || !userRole) {
        throw new Error('Missing required user or team information');
      }

      if (!canManageRoles) {
        throw new Error('You do not have permission to manage roles');
      }

      // Find member to get current role
      const member = members.find((m) => m.user_id === memberId);
      if (!member) {
        throw new Error('Member not found');
      }

      // Validate transition
      const validation = roleService.validateRoleTransition(member.role, newRole, userRole);
      if (!validation.valid) {
        throw new Error(validation.reason || 'Invalid role transition');
      }

      try {
        await roleService.updateUserRoleInTeam(memberId, currentTeam.id, newRole, user.id);

        // Update local state
        setMembers((prev) =>
          prev.map((m) => (m.user_id === memberId ? { ...m, role: newRole } : m))
        );
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [user, currentTeam, userRole, canManageRoles, members]
  );

  // Check if user can update a specific role
  const canUpdateRole = useCallback(
    (targetRole: UserRole): boolean => {
      if (!userRole) return false;

      const ROLE_HIERARCHY: Record<UserRole, number> = {
        owner: 4,
        admin: 3,
        member: 2,
        guest: 1,
      };

      return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
    },
    [userRole]
  );

  // Get available roles for assignment
  const availableRoles = userRole ? getAvailableRolesToAssign(userRole) : [];

  // Validate role transition
  const validateRoleTransition = useCallback(
    (currentRole: UserRole, newRole: UserRole) => {
      if (!userRole) {
        return {
          valid: false,
          reason: 'User role not available',
        };
      }

      return roleService.validateRoleTransition(currentRole, newRole, userRole);
    },
    [userRole]
  );

  // Get role statistics
  const getRoleStats = useCallback(async () => {
    if (!currentTeam) {
      throw new Error('Team not available');
    }

    return roleService.getRoleStatistics(currentTeam.id);
  }, [currentTeam]);

  // Get team composition
  const getTeamComposition = useCallback(async () => {
    if (!currentTeam) {
      throw new Error('Team not available');
    }

    return roleService.getTeamComposition(currentTeam.id);
  }, [currentTeam]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadMembers();
  }, [loadMembers]);

  return {
    members,
    loading,
    error,
    updateMemberRole,
    canUpdateRole,
    availableRoles,
    validateRoleTransition,
    getRoleStats,
    getTeamComposition,
    refresh,
  };
}
