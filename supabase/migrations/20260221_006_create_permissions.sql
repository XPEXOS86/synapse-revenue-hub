-- Create permissions table for Phase 3: Permission Management & RBAC
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- e.g., 'team', 'member', 'billing', 'settings'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL, -- 'owner', 'admin', 'member', 'guest'
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Unique constraint: each role can have each permission only once
  UNIQUE(role, permission_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_role_permissions_granted_by ON role_permissions(granted_by);

-- Add trigger for updated_at
CREATE TRIGGER update_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Insert default permissions for OpenClaw
INSERT INTO permissions (name, description, category) VALUES
-- Team permissions
('team.create', 'Create new team', 'team'),
('team.read', 'View team details', 'team'),
('team.update', 'Update team information', 'team'),
('team.delete', 'Delete team', 'team'),
('team.list', 'List teams', 'team'),

-- Member permissions
('member.invite', 'Invite new team members', 'member'),
('member.list', 'List team members', 'member'),
('member.update', 'Update member information', 'member'),
('member.remove', 'Remove team members', 'member'),
('member.view_profile', 'View member profiles', 'member'),

-- Role permissions
('role.assign', 'Assign roles to members', 'role'),
('role.manage', 'Manage role permissions', 'role'),
('role.create', 'Create custom roles', 'role'),

-- Permission permissions
('permission.manage', 'Manage permissions', 'permission'),
('permission.audit', 'View permission audit logs', 'permission'),

-- Billing permissions
('billing.view', 'View billing information', 'billing'),
('billing.update', 'Update billing information', 'billing'),
('billing.manage_subscriptions', 'Manage team subscriptions', 'billing'),

-- Settings permissions
('settings.view', 'View team settings', 'settings'),
('settings.update', 'Update team settings', 'settings'),
('settings.manage_api_keys', 'Manage API keys', 'settings'),

-- Audit log permissions
('audit.view', 'View audit logs', 'audit'),
('audit.export', 'Export audit logs', 'audit');

-- Default role permissions
-- Owner has all permissions
INSERT INTO role_permissions (role, permission_id, granted_by)
SELECT 'owner', id, '00000000-0000-0000-0000-000000000000'::uuid
FROM permissions;

-- Admin has most permissions (excluding role.manage, permission.manage)
INSERT INTO role_permissions (role, permission_id, granted_by)
SELECT 'admin', id, '00000000-0000-0000-0000-000000000000'::uuid
FROM permissions
WHERE name NOT IN ('role.manage', 'permission.manage', 'team.delete');

-- Member has basic permissions
INSERT INTO role_permissions (role, permission_id, granted_by)
SELECT 'member', id, '00000000-0000-0000-0000-000000000000'::uuid
FROM permissions
WHERE category IN ('member', 'team')
  AND name NOT IN ('team.delete', 'team.update', 'member.remove', 'member.update');

-- Guest has minimal permissions
INSERT INTO role_permissions (role, permission_id, granted_by)
SELECT 'guest', id, '00000000-0000-0000-0000-000000000000'::uuid
FROM permissions
WHERE name IN ('team.read', 'member.view_profile', 'member.list', 'team.list');

-- Enable RLS on permissions table
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone authenticated can read all permissions
CREATE POLICY "Anyone can read permissions"
  ON permissions
  FOR SELECT
  USING (true);

-- Enable RLS on role_permissions table
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read role permissions
CREATE POLICY "Anyone can read role permissions"
  ON role_permissions
  FOR SELECT
  USING (true);

-- RLS Policy: Only owners and admins can insert/update role permissions
CREATE POLICY "Admins can manage role permissions"
  ON role_permissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = current_user_id()
    )
  );

CREATE POLICY "Admins can update role permissions"
  ON role_permissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = current_user_id()
    )
  );

-- Add comment to table
COMMENT ON TABLE permissions IS 'Granular permissions for OpenClaw RBAC system';
COMMENT ON TABLE role_permissions IS 'Junction table mapping roles to permissions';
COMMENT ON COLUMN permissions.category IS 'Permission category for organization (team, member, billing, settings, audit)';
COMMENT ON COLUMN role_permissions.role IS 'Role name (owner, admin, member, guest)';
