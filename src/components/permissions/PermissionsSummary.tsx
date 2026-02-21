/**
 * PermissionsSummary Component
 * Shows a high-level summary of user permissions
 */

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLE_LABELS, getRoleColor } from '@/lib/permissions';

export function PermissionsSummary() {
  const {
    userRole,
    isOwner,
    isAdmin,
    isMember,
    isGuest,
    canManageMembers,
    canManageRoles,
    canManageBilling,
    canViewAudit,
  } = usePermissions();

  if (!userRole) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Unable to load permission information.</p>
      </div>
    );
  }

  const roleInfo = ROLE_LABELS[userRole];
  const bgColor = getRoleColor(userRole);

  const capabilities = [
    { label: 'Manage Members', allowed: canManageMembers },
    { label: 'Manage Roles', allowed: canManageRoles },
    { label: 'View Billing', allowed: canManageBilling },
    { label: 'View Audit Logs', allowed: canViewAudit },
    { label: 'Owner Access', allowed: isOwner },
    { label: 'Admin Access', allowed: isAdmin },
  ];

  return (
    <div className="space-y-4">
      <div className={`${bgColor} p-4 rounded-lg border-2 border-opacity-50`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">Your Role</h3>
            <p className="text-sm opacity-75 mt-1">{roleInfo.description}</p>
          </div>
          <span className={`px-3 py-1 rounded font-semibold text-sm bg-white bg-opacity-20`}>
            {roleInfo.label}
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Your Capabilities</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {capabilities.map((capability) => (
            <div
              key={capability.label}
              className="flex items-center gap-2 p-2 rounded"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  capability.allowed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              <span className={capability.allowed ? 'text-gray-900' : 'text-gray-500'}>
                {capability.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Role Hierarchy</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>Owner > Admin > Member > Guest</p>
          <p>Your current level: <strong>{roleInfo.label}</strong></p>
          {isOwner && (
            <p className="text-blue-900 font-medium">You have full access to all team features.</p>
          )}
          {isAdmin && !isOwner && (
            <p className="text-blue-900 font-medium">You have administrative access to manage team members and settings.</p>
          )}
          {isMember && (
            <p className="text-blue-900 font-medium">You have standard team member access.</p>
          )}
          {isGuest && (
            <p className="text-blue-900 font-medium">You have read-only access to team information.</p>
          )}
        </div>
      </div>
    </div>
  );
}
