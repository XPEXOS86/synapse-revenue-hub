/**
 * Role & Permission Settings Page
 * Complete role and permission management interface
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { PermissionsSummary } from '@/components/permissions/PermissionsSummary';
import { PermissionPanel } from '@/components/permissions/PermissionPanel';
import { TeamMemberRoleManager } from '@/components/permissions/TeamMemberRoleManager';
import { ROLE_LABELS } from '@/lib/permissions';
import type { UserRole } from '@/types/permissions';

export default function RolePermissionSettings() {
  const { user, currentTeam } = useAuth();
  const { canManageRoles, canManagePermissions, userRole } = usePermissions();
  const { getRoleStats, getTeamComposition } = useRoleManagement();

  const [activeTab, setActiveTab] = useState<
    'summary' | 'members' | 'permissions' | 'composition'
  >('summary');
  const [stats, setStats] = useState<Record<UserRole, number> | null>(null);
  const [composition, setComposition] = useState<any>(null);

  React.useEffect(() => {
    loadStats();
  }, [currentTeam]);

  const loadStats = async () => {
    try {
      const [statsData, compositionData] = await Promise.all([
        getRoleStats(),
        getTeamComposition(),
      ]);
      setStats(statsData);
      setComposition(compositionData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!user || !currentTeam) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please select a team first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Role & Permission Settings</h1>
          <p className="text-gray-600 mt-2">Manage team roles, members, and permissions</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            {[
              { id: 'summary', label: 'Summary' },
              { id: 'members', label: 'Team Members', disabled: !canManageRoles },
              { id: 'permissions', label: 'Permissions', disabled: !canManagePermissions },
              { id: 'composition', label: 'Team Composition' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Permissions</h2>
              <PermissionsSummary />
            </div>
          )}

          {/* Team Members Tab */}
          {activeTab === 'members' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
              <TeamMemberRoleManager />
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Permissions</h2>
              <div className="space-y-6">
                {['owner', 'admin', 'member', 'guest'].map((role) => (
                  <div
                    key={role}
                    className="border border-gray-200 rounded-lg p-6 bg-white"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {ROLE_LABELS[role as UserRole].label}
                    </h3>
                    <PermissionPanel role={role as UserRole} editable={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Composition Tab */}
          {activeTab === 'composition' && composition && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Composition</h2>

              {/* Overall Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {['owner', 'admin', 'member', 'guest'].map((role) => {
                  const roleData = composition.byRole[role as UserRole];
                  const roleInfo = ROLE_LABELS[role as UserRole];

                  return (
                    <div
                      key={role}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <p className="text-sm text-gray-600">{roleInfo.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {roleData.count}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {roleData.percentage.toFixed(1)}% of team
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Composition Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Team Distribution</h3>

                <div className="space-y-3">
                  {['owner', 'admin', 'member', 'guest'].map((role) => {
                    const roleData = composition.byRole[role as UserRole];
                    const roleInfo = ROLE_LABELS[role as UserRole];

                    return (
                      <div key={role}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {roleInfo.label}
                          </span>
                          <span className="text-sm text-gray-600">
                            {roleData.count} ({roleData.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              role === 'owner'
                                ? 'bg-red-500'
                                : role === 'admin'
                                  ? 'bg-orange-500'
                                  : role === 'member'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-500'
                            }`}
                            style={{ width: `${roleData.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  Total Team Members: <strong>{composition.total}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
