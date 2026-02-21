/**
 * TeamMemberRoleManager Component
 * Manages and displays team member roles
 */

import React, { useState } from 'react';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { usePermissions } from '@/hooks/usePermissions';
import { getRoleColor, ROLE_LABELS } from '@/lib/permissions';
import { RoleSelector } from './RoleSelector';
import type { UserRole } from '@/types/permissions';

export function TeamMemberRoleManager() {
  const { members, loading, error, updateMemberRole, availableRoles } = useRoleManagement();
  const { canManageRoles, userRole } = usePermissions();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  if (!canManageRoles) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          You don't have permission to manage team member roles.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">{error.message}</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">No team members found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {members.map((member) => {
          const isSelected = selectedMemberId === member.user_id;
          const bgColor = getRoleColor(member.role);
          const canChangeRole = availableRoles.includes(member.role as UserRole);

          return (
            <div
              key={member.user_id}
              className={`border-2 rounded-lg p-4 transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {member.profile?.username || member.profile?.email || 'Unknown User'}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor}`}>
                      {ROLE_LABELS[member.role].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{member.profile?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>

                {canChangeRole && (
                  <button
                    onClick={() => setSelectedMemberId(isSelected ? null : member.user_id)}
                    className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    {isSelected ? 'Cancel' : 'Change Role'}
                  </button>
                )}
              </div>

              {isSelected && canChangeRole && (
                <div className="border-t pt-4 mt-4">
                  <RoleSelector
                    currentRole={member.role}
                    onRoleChange={async (newRole) => {
                      setUpdating(true);
                      try {
                        await updateMemberRole(member.user_id, newRole);
                        setSelectedMemberId(null);
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    disabled={updating}
                    showDescriptions={false}
                    selectableRoles={availableRoles}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Role Management Info</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>You can assign roles up to your current level: <strong>{userRole?.toUpperCase()}</strong></li>
          <li>Click "Change Role" on a team member to reassign their role</li>
          <li>Owners can assign any role to any member</li>
          <li>Admins can only assign admin, member, and guest roles</li>
        </ul>
      </div>
    </div>
  );
}
