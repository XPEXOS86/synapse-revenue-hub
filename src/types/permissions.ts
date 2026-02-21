/**
 * Permission System Types
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'guest';

export type PermissionName =
  | 'team.create'
  | 'team.read'
  | 'team.update'
  | 'team.delete'
  | 'team.list'
  | 'member.invite'
  | 'member.list'
  | 'member.update'
  | 'member.remove'
  | 'member.view_profile'
  | 'role.assign'
  | 'role.manage'
  | 'role.create'
  | 'permission.manage'
  | 'permission.audit'
  | 'billing.view'
  | 'billing.update'
  | 'billing.manage_subscriptions'
  | 'settings.view'
  | 'settings.update'
  | 'settings.manage_api_keys'
  | 'audit.view'
  | 'audit.export';

export interface Permission {
  id: string;
  name: PermissionName;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  permission_id: string;
  granted_at: string;
  granted_by?: string;
  permission?: Permission;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  checkedAt: Date;
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  permissions: PermissionName[];
  teamId: string;
  grantedAt: Date;
}

export interface PermissionAction {
  action: string;
  resource: string;
  requiredPermission: PermissionName;
  description: string;
}

export interface RoleDefinition {
  name: UserRole;
  label: string;
  description: string;
  permissions: PermissionName[];
  level: number;
  color: string;
}

export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: 'assign' | 'revoke' | 'modify';
  permission: PermissionName;
  role: UserRole;
  previousValue?: PermissionName;
  newValue?: PermissionName;
  reason?: string;
  timestamp: Date;
}

export interface RoleTransition {
  fromRole: UserRole;
  toRole: UserRole;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

export interface PermissionContext {
  userId: string;
  role: UserRole;
  teamId: string;
  permissions: PermissionName[];
  isAdmin: boolean;
  isOwner: boolean;
  canManageMembers: boolean;
  canManageRoles: boolean;
  canManagePermissions: boolean;
  canViewAudit: boolean;
  canManageBilling: boolean;
}
