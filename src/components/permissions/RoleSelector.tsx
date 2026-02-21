/**
 * RoleSelector Component
 * Allows selection and management of user roles
 */

import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLE_LABELS, getRoleColor } from '@/lib/permissions';
import type { UserRole } from '@/types/permissions';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => Promise<void> | void;
  disabled?: boolean;
  showDescriptions?: boolean;
  selectableRoles?: UserRole[];
}

export function RoleSelector({
  currentRole,
  onRoleChange,
  disabled = false,
  showDescriptions = true,
  selectableRoles,
}: RoleSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = usePermissions();

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === currentRole || loading || disabled) return;

    setLoading(true);
    setError(null);

    try {
      await onRoleChange(newRole);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change role';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const roles: UserRole[] = selectableRoles ||
    userRole === 'owner'
      ? ['owner', 'admin', 'member', 'guest']
      : userRole === 'admin'
        ? ['admin', 'member', 'guest']
        : [];

  if (!userRole || roles.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">You don't have permission to manage roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map((role) => {
          const roleInfo = ROLE_LABELS[role];
          const isSelected = role === currentRole;
          const bgColor = getRoleColor(role);

          return (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              disabled={disabled || loading}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{roleInfo.label}</h4>
                  {showDescriptions && (
                    <p className="text-sm text-gray-600 mt-1">{roleInfo.description}</p>
                  )}
                </div>
                {isSelected && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor}`}>
                    Current
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
