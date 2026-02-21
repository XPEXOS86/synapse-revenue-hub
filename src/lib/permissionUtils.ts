/**
 * Permission Utility Functions
 * Helper functions for permission checking and validation
 */

import { roleHasPermission, isRoleHigherOrEqual } from './permissions';

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: string, permission: string): boolean {
  return roleHasPermission(userRole, permission);
}

/**
 * Check if user has ANY of the provided permissions
 */
export function hasAnyPermission(userRole: string, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user has ALL of the provided permissions
 */
export function hasAllPermissions(userRole: string, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Verify that a user can perform an action on a resource
 */
export function canAccessResource(
  userRole: string,
  requiredPermission: string,
  resourceOwnerRole?: string
): boolean {
  // Check if user has the required permission
  if (!hasPermission(userRole, requiredPermission)) {
    return false;
  }

  // If resource owner is specified, user must have equal or higher role
  if (resourceOwnerRole && !isRoleHigherOrEqual(userRole, resourceOwnerRole)) {
    return false;
  }

  return true;
}

/**
 * Filter resources based on user permissions
 */
export function filterResourcesByPermission(
  userRole: string,
  resources: any[],
  requiredPermission: string,
  ownerRoleProperty: string = 'ownerRole'
): any[] {
  return resources.filter((resource) =>
    canAccessResource(userRole, requiredPermission, resource[ownerRoleProperty])
  );
}

/**
 * Create a permission check function with caching
 */
export function createPermissionChecker(userRole: string) {
  const cache = new Map<string, boolean>();

  return {
    has: (permission: string): boolean => {
      if (!cache.has(permission)) {
        cache.set(permission, hasPermission(userRole, permission));
      }
      return cache.get(permission) ?? false;
    },
    hasAny: (permissions: string[]): boolean => {
      return permissions.some((p) => this.has(p));
    },
    hasAll: (permissions: string[]): boolean => {
      return permissions.every((p) => this.has(p));
    },
    clearCache: (): void => {
      cache.clear();
    },
  };
}

/**
 * Validate permission transition (can change from one role to another)
 */
export function canTransitionRole(
  userRole: string,
  fromRole: string,
  toRole: string
): boolean {
  // User must be able to manage the target role
  return isRoleHigherOrEqual(userRole, toRole) && isRoleHigherOrEqual(userRole, fromRole);
}

/**
 * Get all invalid operations for a role (for UI feedback)
 */
export function getRestrictedOperations(
  userRole: string,
  allOperations: string[]
): string[] {
  return allOperations.filter((operation) => !hasPermission(userRole, operation));
}

/**
 * Batch permission check (useful for performance)
 */
export function checkMultiplePermissions(
  userRole: string,
  permissionMap: Record<string, string>
): Record<string, boolean> {
  const result: Record<string, boolean> = {};

  for (const [key, permission] of Object.entries(permissionMap)) {
    result[key] = hasPermission(userRole, permission);
  }

  return result;
}

/**
 * Get effective permissions at a given timestamp
 * Useful for audit and compliance tracking
 */
export function getEffectivePermissions(
  userRole: string,
  atTimestamp?: Date
): string[] {
  // In the current implementation, permissions don't change over time
  // But this structure allows for time-based permissions in the future
  // (e.g., temporary elevated permissions)

  if (atTimestamp) {
    // Could implement time-based permission logic here
    // For now, return current permissions
  }

  return getRolePermissions(userRole);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: string): string[] {
  const { ROLE_PERMISSIONS } = require('./permissions');
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Merge multiple role permissions (for compound roles)
 */
export function mergeRolePermissions(...roles: string[]): string[] {
  const combined = new Set<string>();

  for (const role of roles) {
    const perms = getRolePermissions(role);
    perms.forEach((p) => combined.add(p));
  }

  return Array.from(combined);
}

/**
 * Create a permission guard for async operations
 */
export async function withPermissionGuard<T>(
  userRole: string,
  requiredPermission: string,
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  if (!hasPermission(userRole, requiredPermission)) {
    throw new Error(
      errorMessage || `User role "${userRole}" does not have permission: ${requiredPermission}`
    );
  }

  return operation();
}

/**
 * Validate user action against permissions
 */
export function validateUserAction(
  userRole: string,
  action: string,
  resource?: { ownerRole?: string }
): { valid: boolean; reason?: string } {
  // Map actions to required permissions
  const actionPermissionMap: Record<string, string> = {
    'team:create': 'team.create',
    'team:read': 'team.read',
    'team:update': 'team.update',
    'team:delete': 'team.delete',
    'team:list': 'team.list',
    'member:invite': 'member.invite',
    'member:list': 'member.list',
    'member:update': 'member.update',
    'member:remove': 'member.remove',
    'member:profile': 'member.view_profile',
    'role:assign': 'role.assign',
    'role:manage': 'role.manage',
    'role:create': 'role.create',
    'billing:view': 'billing.view',
    'billing:update': 'billing.update',
    'settings:view': 'settings.view',
    'settings:update': 'settings.update',
    'audit:view': 'audit.view',
    'audit:export': 'audit.export',
  };

  const requiredPermission = actionPermissionMap[action];

  if (!requiredPermission) {
    return {
      valid: false,
      reason: `Unknown action: ${action}`,
    };
  }

  if (!hasPermission(userRole, requiredPermission)) {
    return {
      valid: false,
      reason: `Insufficient permissions for action: ${action}`,
    };
  }

  // Check resource-level access if owner role is provided
  if (resource?.ownerRole && !isRoleHigherOrEqual(userRole, resource.ownerRole)) {
    return {
      valid: false,
      reason: `Cannot perform action on resource owned by higher role`,
    };
  }

  return { valid: true };
}
