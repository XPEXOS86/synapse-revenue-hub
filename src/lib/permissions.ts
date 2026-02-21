/**
 * Permission System - OpenClaw RBAC
 * Defines all permissions used throughout the application
 */

// Permission Categories
export enum PermissionCategory {
  TEAM = 'team',
  MEMBER = 'member',
  ROLE = 'role',
  PERMISSION = 'permission',
  BILLING = 'billing',
  SETTINGS = 'settings',
  AUDIT = 'audit',
}

// Permission Names - Team
export enum TeamPermission {
  CREATE = 'team.create',
  READ = 'team.read',
  UPDATE = 'team.update',
  DELETE = 'team.delete',
  LIST = 'team.list',
}

// Permission Names - Member
export enum MemberPermission {
  INVITE = 'member.invite',
  LIST = 'member.list',
  UPDATE = 'member.update',
  REMOVE = 'member.remove',
  VIEW_PROFILE = 'member.view_profile',
}

// Permission Names - Role
export enum RolePermission {
  ASSIGN = 'role.assign',
  MANAGE = 'role.manage',
  CREATE = 'role.create',
}

// Permission Names - Permission Management
export enum PermissionManagement {
  MANAGE = 'permission.manage',
  AUDIT = 'permission.audit',
}

// Permission Names - Billing
export enum BillingPermission {
  VIEW = 'billing.view',
  UPDATE = 'billing.update',
  MANAGE_SUBSCRIPTIONS = 'billing.manage_subscriptions',
}

// Permission Names - Settings
export enum SettingsPermission {
  VIEW = 'settings.view',
  UPDATE = 'settings.update',
  MANAGE_API_KEYS = 'settings.manage_api_keys',
}

// Permission Names - Audit
export enum AuditPermission {
  VIEW = 'audit.view',
  EXPORT = 'audit.export',
}

// All permissions as a flat object for easy access
export const ALL_PERMISSIONS = {
  // Team
  'team.create': 'Create new team',
  'team.read': 'View team details',
  'team.update': 'Update team information',
  'team.delete': 'Delete team',
  'team.list': 'List teams',

  // Member
  'member.invite': 'Invite new team members',
  'member.list': 'List team members',
  'member.update': 'Update member information',
  'member.remove': 'Remove team members',
  'member.view_profile': 'View member profiles',

  // Role
  'role.assign': 'Assign roles to members',
  'role.manage': 'Manage role permissions',
  'role.create': 'Create custom roles',

  // Permission
  'permission.manage': 'Manage permissions',
  'permission.audit': 'View permission audit logs',

  // Billing
  'billing.view': 'View billing information',
  'billing.update': 'Update billing information',
  'billing.manage_subscriptions': 'Manage team subscriptions',

  // Settings
  'settings.view': 'View team settings',
  'settings.update': 'Update team settings',
  'settings.manage_api_keys': 'Manage API keys',

  // Audit
  'audit.view': 'View audit logs',
  'audit.export': 'Export audit logs',
} as const;

// Role definitions with their permissions
export const ROLE_PERMISSIONS = {
  owner: [
    // Owner has ALL permissions
    ...Object.keys(ALL_PERMISSIONS),
  ] as string[],
  admin: [
    // Admin has most permissions except role management and permission management
    TeamPermission.CREATE,
    TeamPermission.READ,
    TeamPermission.UPDATE,
    TeamPermission.LIST,
    MemberPermission.INVITE,
    MemberPermission.LIST,
    MemberPermission.UPDATE,
    MemberPermission.REMOVE,
    MemberPermission.VIEW_PROFILE,
    RolePermission.ASSIGN,
    BillingPermission.VIEW,
    BillingPermission.UPDATE,
    BillingPermission.MANAGE_SUBSCRIPTIONS,
    SettingsPermission.VIEW,
    SettingsPermission.UPDATE,
    SettingsPermission.MANAGE_API_KEYS,
    AuditPermission.VIEW,
    AuditPermission.EXPORT,
  ],
  member: [
    // Member has basic permissions
    TeamPermission.READ,
    TeamPermission.LIST,
    MemberPermission.LIST,
    MemberPermission.VIEW_PROFILE,
    SettingsPermission.VIEW,
    BillingPermission.VIEW,
    AuditPermission.VIEW,
  ],
  guest: [
    // Guest has minimal permissions
    TeamPermission.READ,
    TeamPermission.LIST,
    MemberPermission.VIEW_PROFILE,
    MemberPermission.LIST,
  ],
} as const;

// Role hierarchy
export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

// Role labels for UI
export const ROLE_LABELS: Record<string, { label: string; description: string }> = {
  owner: {
    label: 'Owner',
    description: 'Full control over team and all resources',
  },
  admin: {
    label: 'Admin',
    description: 'Administrative access, cannot manage roles',
  },
  member: {
    label: 'Member',
    description: 'Standard team member with limited permissions',
  },
  guest: {
    label: 'Guest',
    description: 'Read-only access to team information',
  },
};

// Permission groups for UI organization
export const PERMISSION_GROUPS = {
  [PermissionCategory.TEAM]: {
    label: 'Team Management',
    permissions: [
      TeamPermission.CREATE,
      TeamPermission.READ,
      TeamPermission.UPDATE,
      TeamPermission.DELETE,
      TeamPermission.LIST,
    ],
  },
  [PermissionCategory.MEMBER]: {
    label: 'Member Management',
    permissions: [
      MemberPermission.INVITE,
      MemberPermission.LIST,
      MemberPermission.UPDATE,
      MemberPermission.REMOVE,
      MemberPermission.VIEW_PROFILE,
    ],
  },
  [PermissionCategory.ROLE]: {
    label: 'Role Management',
    permissions: [RolePermission.ASSIGN, RolePermission.MANAGE, RolePermission.CREATE],
  },
  [PermissionCategory.PERMISSION]: {
    label: 'Permission Management',
    permissions: [PermissionManagement.MANAGE, PermissionManagement.AUDIT],
  },
  [PermissionCategory.BILLING]: {
    label: 'Billing & Subscriptions',
    permissions: [
      BillingPermission.VIEW,
      BillingPermission.UPDATE,
      BillingPermission.MANAGE_SUBSCRIPTIONS,
    ],
  },
  [PermissionCategory.SETTINGS]: {
    label: 'Team Settings',
    permissions: [
      SettingsPermission.VIEW,
      SettingsPermission.UPDATE,
      SettingsPermission.MANAGE_API_KEYS,
    ],
  },
  [PermissionCategory.AUDIT]: {
    label: 'Audit & Compliance',
    permissions: [AuditPermission.VIEW, AuditPermission.EXPORT],
  },
} as const;

// Check if a role has a permission
export function roleHasPermission(role: string, permission: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
  return rolePerms ? rolePerms.includes(permission) : false;
}

// Check if a role is higher or equal to another
export function isRoleHigherOrEqual(role: string, compareRole: string): boolean {
  const roleLevel = ROLE_HIERARCHY[role] || 0;
  const compareLevel = ROLE_HIERARCHY[compareRole] || 0;
  return roleLevel >= compareLevel;
}

// Get all permissions for a role
export function getPermissionsForRole(role: string): string[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}

// Get permission description
export function getPermissionDescription(permission: string): string {
  return ALL_PERMISSIONS[permission as keyof typeof ALL_PERMISSIONS] || 'Unknown permission';
}

// Get permission category
export function getPermissionCategory(permission: string): PermissionCategory | null {
  const prefix = permission.split('.')[0];
  return Object.values(PermissionCategory).includes(prefix as PermissionCategory)
    ? (prefix as PermissionCategory)
    : null;
}

// Check if user can manage permissions for another user
export function canManageUserRole(userRole: string, targetRole: string): boolean {
  // Can only manage roles lower in hierarchy
  return isRoleHigherOrEqual(userRole, targetRole) && userRole !== targetRole;
}

// Get role color for UI
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    owner: 'bg-red-100 text-red-800',
    admin: 'bg-orange-100 text-orange-800',
    member: 'bg-blue-100 text-blue-800',
    guest: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}
