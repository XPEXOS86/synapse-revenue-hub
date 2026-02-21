# OpenClaw Authentication System - Implementation Guide

## Overview

This document describes the **OpenClaw Authentication System** implementation for Phases 1-2, which establishes a robust, scalable authentication and team management infrastructure.

## Phase 1: Database Schema & Migrations

### Tables Created

#### 1. `profiles`
Extends the native Supabase `auth.users` table with additional user information.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Features:**
- Auto-created on user signup via trigger
- RLS policies allow users to view all profiles (public)
- Users can only update their own profile
- Automatic `updated_at` timestamp management

#### 2. `teams`
Workspace for team collaboration with owner-based hierarchy.

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Features:**
- Each team has a single owner
- Slug provides user-friendly team URLs
- RLS policies restrict access to team members only
- Team owners can fully manage teams

#### 3. `team_members`
Manages team membership with role-based access control (RBAC).

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' 
    CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  permissions JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);
```

**Roles:**
- **owner** - Full control over team, can manage all members
- **admin** - Can manage members but cannot delete team
- **member** - Can access team resources with limitations
- **guest** - Read-only access to team resources

#### 4. `team_invitations`
Manages pending team invitations with token-based verification.

```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Features:**
- Invitation tokens are unique and time-limited (7 days)
- Track invitation status (pending, accepted, declined, expired)
- RLS allows users to view their own invitations

#### 5. `audit_logs`
Track all system actions for compliance and security.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  changes JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Features:**
- Logs all team modifications
- Tracks user actions for audit trails
- Can store before/after state changes in `changes` JSONB

### Database Functions

#### `update_updated_at()`
Automatically updates the `updated_at` timestamp on table modifications.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### `create_profile_on_signup()`
Automatically creates a user profile when a new auth user is registered.

```sql
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username)
  VALUES (NEW.id, NEW.email, 'user_' || substr(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `log_action()`
Logs team actions for audit purposes.

```sql
CREATE OR REPLACE FUNCTION log_action(
  p_user_id UUID,
  p_team_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id VARCHAR,
  p_changes JSONB DEFAULT '{}'::jsonb,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

All tables have Row Level Security enabled with granular policies:

**Profiles:**
- Anyone can view all profiles (public visibility)
- Users can only update their own profile

**Teams:**
- Only team members can view teams they belong to
- Team owners can manage their teams

**Team Members:**
- Team members can view other members in their teams
- Only team admins/owners can add/remove members

**Team Invitations:**
- Invited users can view their invitations
- Team admins/owners can create and revoke invitations

**Audit Logs:**
- Only team admins can view team audit logs

## Phase 2: Authentication System Improvements

### Enhanced AuthContext

The `AuthContext` now manages:

```typescript
interface AuthContextType {
  // Original auth state
  user: User | null;
  session: Session | null;
  loading: boolean;

  // New: User profile
  profile: UserProfile | null;

  // New: Team management
  currentTeam: Team | null;
  teams: Team[];
  teamMember: TeamMember | null;

  // New: Team management functions
  loadProfile: () => Promise<void>;
  loadTeams: () => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;

  // Existing functions
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}
```

**Key Features:**
- Automatic profile loading on user login
- Automatic team loading once profile is available
- Manual team switching with `setCurrentTeam()`
- Current team member role tracking

### Custom Hooks

#### `useTeams()`
Manage team operations:

```typescript
const { createTeam, inviteTeamMember, updateTeamMemberRole, removeTeamMember } = useTeams();

// Create a new team
await createTeam({
  name: "My Team",
  slug: "my-team",
  description: "Our awesome team",
  logo_url: "https://..."
});

// Invite team member
await inviteTeamMember({
  email: "user@example.com",
  role: "member"
});

// Update member role
await updateTeamMemberRole(memberId, "admin");

// Remove member
await removeTeamMember(memberId);
```

#### `useProfile()`
Manage user profile:

```typescript
const { profile, updateProfile, uploadAvatar } = useProfile();

// Update profile info
await updateProfile({
  username: "newusername",
  full_name: "Full Name",
  bio: "My bio"
});

// Upload avatar
await uploadAvatar(file);
```

### Components

#### `EditProfileForm`
Form component for editing user profile:
- Upload avatar with preview
- Edit username, full name, and bio
- Loading states and error handling

**Usage:**
```tsx
import { EditProfileForm } from "@/components/auth/EditProfileForm";

<EditProfileForm />
```

#### `TeamManagement`
Manage teams:
- List all user's teams
- Create new teams
- Switch between teams
- Visual team cards with logos

**Usage:**
```tsx
import { TeamManagement } from "@/components/auth/TeamManagement";

<TeamManagement />
```

#### `TeamMembers`
Manage team members:
- List all team members with avatars
- Invite new members (admin only)
- Change member roles (admin only)
- Remove members (admin only)

**Usage:**
```tsx
import { TeamMembers } from "@/components/auth/TeamMembers";

<TeamMembers />
```

### Account Settings Page

Centralized settings page at `/account-settings` with three tabs:

1. **Profile Tab**
   - Edit profile information
   - Upload/change avatar

2. **Teams Tab**
   - List all teams
   - Create new teams
   - Switch between teams

3. **Members Tab**
   - List team members
   - Invite new members
   - Manage member roles
   - Remove members

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx              # Enhanced auth context with teams
├── hooks/
│   ├── use-teams.ts                 # Team management hook
│   └── use-profile.ts               # Profile management hook
├── components/auth/
│   ├── EditProfileForm.tsx          # Profile editing form
│   ├── TeamManagement.tsx           # Team list and creation
│   └── TeamMembers.tsx              # Team member management
├── pages/
│   ├── AccountSettings.tsx          # Main settings page
│   └── Auth.tsx                     # Login/signup (unchanged)
└── integrations/supabase/
    └── client.ts                    # Supabase client (unchanged)

supabase/
└── migrations/
    ├── 20260220_000_create_base_functions.sql
    ├── 20260220_001_create_profiles.sql
    ├── 20260220_002_create_teams.sql
    ├── 20260220_003_create_team_members.sql
    ├── 20260220_004_create_team_invitations.sql
    └── 20260220_005_create_audit_logs.sql
```

## Setup Instructions

### 1. Run Database Migrations

The migrations have already been executed on your Supabase instance:
- ✅ Base functions created
- ✅ All tables created
- ✅ RLS policies enabled
- ✅ Triggers configured

### 2. Environment Variables

Ensure these are set in your `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### 3. Use the Components

Add to your pages:
```tsx
import AccountSettings from "@/pages/AccountSettings";

// In your router
<Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
```

## Testing

Run the test script to validate the system:
```bash
npm run test:auth
# or
ts-node scripts/test-auth-system.ts
```

The test validates:
- ✓ Database schema and tables
- ✓ RLS policies and access control
- ✓ Auth context types
- ✓ Components and hooks
- ✓ Database functions

## Next Steps (Phase 3+)

### Phase 3: Advanced Features
- [ ] Granular permission management
- [ ] Email notifications for invitations
- [ ] Invitation acceptance/rejection flow
- [ ] Team settings and customization

### Phase 4: Admin Dashboard
- [ ] Analytics by team
- [ ] Usage tracking
- [ ] Member activity logs
- [ ] Audit log viewer

### Phase 5: API & Integrations
- [ ] Public team profile pages
- [ ] API keys per team
- [ ] Webhook system
- [ ] Third-party integrations

## Security Considerations

1. **RLS Policies**: All tables have strict RLS to prevent unauthorized access
2. **Audit Logging**: All actions are logged for compliance
3. **Token-based Invitations**: Secure, time-limited invitation tokens
4. **Role-based Access**: RBAC with four distinct roles
5. **Data Ownership**: Clear ownership model (user → profile → teams)

## Common Tasks

### Create a Team
```tsx
const { createTeam } = useTeams();
await createTeam({
  name: "Design Team",
  slug: "design",
  description: "UI/UX Design"
});
```

### Invite Team Members
```tsx
const { inviteTeamMember } = useTeams();
await inviteTeamMember({
  email: "designer@example.com",
  role: "member"
});
```

### Update User Profile
```tsx
const { updateProfile } = useProfile();
await updateProfile({
  full_name: "John Doe",
  bio: "Product Designer"
});
```

### Switch Teams
```tsx
const { setCurrentTeam } = useAuth();
setCurrentTeam(selectedTeam);
```

## Support & Documentation

For detailed API documentation, see the inline code comments in:
- `src/contexts/AuthContext.tsx`
- `src/hooks/use-teams.ts`
- `src/hooks/use-profile.ts`

For Supabase documentation: https://supabase.com/docs
For React documentation: https://react.dev

---

**Last Updated**: February 20, 2026
**Status**: Phase 1-2 Complete, Ready for Phase 3
