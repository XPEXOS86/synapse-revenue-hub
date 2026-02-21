# OpenClaw Authentication System - Quick Start Guide

## Getting Started

This guide walks you through using the OpenClaw authentication system in your application.

---

## 1. Understanding the Architecture

### Three Layers

**Layer 1: Services** (`src/services/`)
- Pure functions that interact with Supabase
- Reusable across components
- Full TypeScript typing

**Layer 2: AuthContext** (`src/contexts/AuthContext.tsx`)
- React Context for state management
- Provides user, team, and auth state
- Automatically syncs with Supabase

**Layer 3: Components** (`src/components/auth/`)
- Pre-built UI components
- Use hooks to integrate with AuthContext
- Ready to use in any page

---

## 2. Basic Usage

### A. Sign Up & Sign In

```typescript
import { useAuth } from "@/contexts/AuthContext";

function LoginPage() {
  const { signUp, signIn, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    const { error } = await signUp(email, password);
    if (!error) {
      // User signed up successfully
    }
  };

  const handleSignIn = async () => {
    const { error } = await signIn(email, password);
    if (!error) {
      // User signed in successfully
    }
  };

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button onClick={handleSignUp} disabled={loading}>
        Sign Up
      </button>
      <button onClick={handleSignIn} disabled={loading}>
        Sign In
      </button>
      {error && <p>{error.message}</p>}
    </div>
  );
}
```

### B. Access User Data

```typescript
function UserDashboard() {
  const { user, profile, currentTeam, teams } = useAuth();

  return (
    <div>
      <h1>Welcome, {profile?.full_name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Current Team: {currentTeam?.name}</p>
      <h2>Your Teams:</h2>
      <ul>
        {teams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 3. Working with Teams

### Create a Team

```typescript
import { useAuth } from "@/contexts/AuthContext";

function CreateTeamForm() {
  const { createTeam } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleCreate = async () => {
    try {
      const team = await createTeam(name, slug);
      console.log("Team created:", team.id);
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Team name"
      />
      <input 
        value={slug} 
        onChange={(e) => setSlug(e.target.value)} 
        placeholder="team-slug"
      />
      <button onClick={handleCreate}>Create Team</button>
    </div>
  );
}
```

### Invite Team Members

```typescript
import { useAuth } from "@/contexts/AuthContext";

function InviteMember() {
  const { inviteTeamMember, currentTeam } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");

  const handleInvite = async () => {
    try {
      await inviteTeamMember(email, role);
      console.log(`Invitation sent to ${email}`);
    } catch (error) {
      console.error("Failed to invite:", error);
    }
  };

  return (
    <div>
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="email@example.com"
      />
      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleInvite}>Invite</button>
    </div>
  );
}
```

---

## 4. Using Pre-built Components

### Profile Settings

```typescript
import { ProfileSettings } from "@/components/auth/ProfileSettings";

function SettingsPage() {
  return (
    <div>
      <ProfileSettings />
    </div>
  );
}
```

### Create Team Component

```typescript
import { CreateTeam } from "@/components/auth/CreateTeam";

function TeamSetupPage() {
  return (
    <div>
      <CreateTeam onSuccess={() => console.log("Team created!")} />
    </div>
  );
}
```

### Team Invitations

```typescript
import { TeamInvitations } from "@/components/auth/TeamInvitations";

function InvitationPage() {
  return (
    <div>
      <TeamInvitations />
    </div>
  );
}
```

### Complete Settings Dashboard

```typescript
import TeamSettings from "@/pages/TeamSettings";

function AppRouter() {
  return (
    <Route path="/settings" element={<TeamSettings />} />
  );
}
```

---

## 5. Direct Service Usage

### When to Use Services Directly

Use services when you need to:
- Perform operations outside of React components
- Avoid creating extra components
- Implement custom business logic

### Team Service Example

```typescript
import * as teamService from "@/services/teamService";

// Get user's teams
const teams = await teamService.getUserTeams(userId);

// Get team members
const members = await teamService.getTeamMembers(teamId);

// Check if user is owner
const isOwner = await teamService.isTeamOwner(teamId, userId);

// Update member role
await teamService.updateTeamMemberRole(memberId, "admin");
```

### Profile Service Example

```typescript
import * as profileService from "@/services/profileService";

// Get profile
const profile = await profileService.getUserProfile(userId);

// Update profile
await profileService.updateUserProfile(userId, {
  full_name: "New Name",
  bio: "New bio"
});

// Check username availability
const available = await profileService.isUsernameAvailable("johndoe");
```

### Invitation Service Example

```typescript
import * as invitationService from "@/services/invitationService";

// Send invitation
await invitationService.inviteUserToTeam(
  teamId,
  "user@example.com",
  "member",
  invitedByUserId
);

// Accept invitation
await invitationService.acceptInvitation(invitationId, userId);

// Get pending invitations
const pending = await invitationService.getUserPendingInvitations(email);
```

---

## 6. Audit Logging

All user actions are automatically logged. Access logs using the audit service:

```typescript
import { getTeamAuditLogs, AuditActions } from "@/services/auditService";

// Get team's audit trail
const { logs, total } = await getTeamAuditLogs(teamId, {
  limit: 50,
  action: AuditActions.MEMBER_ADDED,
});

// Logs include:
// - User ID
// - Action type
// - Resource type and ID
// - Changes (before/after)
// - IP address and user agent
// - Timestamp
```

---

## 7. Type Safety

All services export TypeScript types:

```typescript
import type { Team, TeamMember, TeamInvitation } from "@/services/teamService";
import type { UserProfile } from "@/services/profileService";

const team: Team = {
  id: "...",
  name: "My Team",
  slug: "my-team",
  // ... other fields
};

const member: TeamMember = {
  id: "...",
  team_id: "...",
  user_id: "...",
  role: "admin",
  // ... other fields
};
```

---

## 8. Error Handling

All services throw errors with descriptive messages:

```typescript
try {
  await teamService.createTeam(userId, {
    name: "My Team",
    slug: "my-team"
  });
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // "Failed to create team: Team slug must be unique"
  }
}
```

---

## 9. Common Patterns

### Protected Routes

```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Team-based Access

```typescript
function TeamPage() {
  const { currentTeam, teamMember } = useAuth();

  if (!currentTeam) {
    return <p>Please select a team</p>;
  }

  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";

  return (
    <div>
      <h1>{currentTeam.name}</h1>
      {isAdmin && <button>Manage Team</button>}
    </div>
  );
}
```

### Loading States

```typescript
function MyComponent() {
  const { loading } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) return <Spinner />;

  return (
    <button disabled={actionLoading}>
      {actionLoading ? "Loading..." : "Submit"}
    </button>
  );
}
```

---

## 10. Next Steps

### For Development
1. Import components into your pages
2. Use `useAuth()` hook for user data
3. Call service functions for operations
4. All data syncs automatically via AuthContext

### For Testing
1. Sign up a test user
2. Create a test team
3. Invite another test user
4. Verify audit logs are created
5. Test role changes and member removal

### For Production
1. Ensure RLS policies are enforced
2. Set up environment variables properly
3. Enable email verification
4. Configure audit log retention
5. Set up monitoring for errors

---

## 11. Troubleshooting

### Issue: Components not showing user data

**Solution**: Ensure AuthProvider wraps your app:
```typescript
<AuthProvider>
  <YourApp />
</AuthProvider>
```

### Issue: Invitations not being sent

**Solution**: Check that team_invitations table has RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'team_invitations';
```

### Issue: Audit logs not appearing

**Solution**: Verify user belongs to a team:
```typescript
const teams = await teamService.getUserTeams(userId);
console.log(teams.length); // Should be > 0
```

### Issue: Profile updates failing

**Solution**: Ensure user_id matches authenticated user:
```typescript
const user = await authService.getCurrentUser();
await profileService.updateUserProfile(user.id, { /* ... */ });
```

---

## 12. API Reference

See detailed API reference in:
- **Service documentation**: JSDoc comments in `src/services/`
- **Component props**: TypeScript interfaces in component files
- **Type definitions**: Import types from service files

---

## Support

For issues or questions:
1. Check error messages carefully
2. Review service JSDoc comments
3. Examine component source code
4. Check PHASE_1_2_IMPLEMENTATION.md for details

---

**Happy coding with OpenClaw!**
