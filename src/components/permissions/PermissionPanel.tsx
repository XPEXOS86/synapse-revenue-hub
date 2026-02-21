/**
 * PermissionPanel Component
 * Displays permissions for a role in an organized way
 */

import React, { useEffect, useState } from 'react';
import { PERMISSION_GROUPS, getPermissionDescription } from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import type { UserRole, PermissionName } from '@/types/permissions';

interface PermissionPanelProps {
  role: UserRole;
  permissions?: PermissionName[];
  editable?: boolean;
  onPermissionChange?: (permission: PermissionName, granted: boolean) => Promise<void>;
}

export function PermissionPanel({
  role,
  permissions,
  editable = false,
  onPermissionChange,
}: PermissionPanelProps) {
  const [grantedPermissions, setGrantedPermissions] = useState<Set<PermissionName>>(
    new Set(permissions || [])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canManagePermissions } = usePermissions();

  useEffect(() => {
    setGrantedPermissions(new Set(permissions || []));
  }, [permissions]);

  const handlePermissionToggle = async (permission: PermissionName) => {
    if (!editable || !onPermissionChange || !canManagePermissions) return;

    const isGranted = grantedPermissions.has(permission);

    setLoading(true);
    setError(null);

    try {
      await onPermissionChange(permission, isGranted);

      // Update local state optimistically
      const updated = new Set(grantedPermissions);
      if (isGranted) {
        updated.delete(permission);
      } else {
        updated.add(permission);
      }
      setGrantedPermissions(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update permission';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Role: {role.toUpperCase()}</h3>
        <p className="text-sm text-gray-600">Total Permissions: {grantedPermissions.size}</p>
      </div>

      {Object.entries(PERMISSION_GROUPS).map(([category, group]: any) => (
        <div key={category} className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">{group.label}</h4>

          <div className="space-y-3">
            {group.permissions.map((permission: PermissionName) => {
              const isGranted = grantedPermissions.has(permission);
              const description = getPermissionDescription(permission);

              return (
                <div
                  key={permission}
                  className="flex items-start gap-3 p-3 bg-white rounded border border-gray-100 hover:border-gray-300"
                >
                  {editable && canManagePermissions ? (
                    <input
                      type="checkbox"
                      checked={isGranted}
                      onChange={() => handlePermissionToggle(permission)}
                      disabled={loading}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer disabled:opacity-50"
                    />
                  ) : (
                    <div
                      className={`mt-1 h-4 w-4 rounded border-2 ${
                        isGranted
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                        {permission}
                      </code>
                      {isGranted && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                          Granted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
