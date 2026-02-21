# OpenClaw Authentication System - Architecture Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components Layer                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages:                    Components:                 │   │
│  │ - TeamSettings           - ProfileSettings           │   │
│  │ - Dashboard              - CreateTeam                │   │
│  │                          - TeamInvitations           │   │
│  │                          - TeamMembers               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              AuthContext (State Management)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Provides:                                             │   │
│  │ - user, session, profile, teams, currentTeam         │   │
│  │ - Subscription state                                 │   │
│  │ - Methods: signUp, signIn, signOut                   │   │
│  │ - Team methods: createTeam, inviteTeamMember, etc.   │   │
│  │ - Profile methods: updateProfile                     │   │
│  │ - Invitation methods: acceptTeamInvitation, etc.     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────────┬────────────┬────────────┬───────────┐  │
│  │ authService      │ teamService│ invitation │ profile   │  │
│  │                  │            │ Service    │ Service   │  │
│  │ - signUp         │ - createTeam│ - invite  │ - get     │  │
│  │ - signIn         │ - getTeams  │ - accept  │ - create  │  │
│  │ - signOut        │ - getMembers│ - decline │ - update  │  │
│  │ - resetPassword  │ - updateRole│ - getPending│ - search │  │
│  │ - sendMagicLink  │ - removeMember│ - cancel  │ - check │  │
│  └──────────────────┴────────────┴────────────┴───────────┘  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ auditService                                         │    │
│  │ - logAuditAction                                     │    │
│  │ - getTeamAuditLogs                                   │    │
│  │ - getUserActivity                                    │    │
│  │ - getTeamMemberActivity                              │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Supabase Client                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ - Authentication (Supabase Auth)                     │   │
│  │ - Database (PostgreSQL via PostgREST)                │   │
│  │ - Real-time subscriptions                            │   │
│  │ - Edge functions                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│            PostgreSQL Database with RLS                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tables:                  Policies:                   │   │
│  │ - profiles              - User-based access control │   │
│  │ - teams                 - Team-based isolation      │   │
│  │ - team_members          - Role-based permissions    │   │
│  │ - team_invitations      - Admin-only operations     │   │
│  │ - audit_logs            - Compliance tracking       │   │
│  │ - (existing tables)     - (existing policies)       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Authentication Flow

```
User Input (Email, Password)
    │
    ▼
┌─────────────────┐
│ SignUp/SignIn   │
│ Component       │
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ useAuth()        │ (AuthContext)
│ signUp/signIn    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ authService      │
│ signUp/signIn    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ supabase.auth.signUp()   │
│ supabase.auth.signIn()   │
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────┐
│ Supabase Auth (JWT)    │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────────┐
│ Session Created            │
│ - JWT Token                │
│ - Refresh Token            │
│ - User Metadata            │
└────────┬───────────────────┘
         │
         ▼
┌──────────────────────────┐
│ AuthContext Updated      │
│ - user set               │
│ - session set            │
│ - profile loaded         │
│ - teams loaded           │
└──────────────────────────┘
```

### Team Creation Flow

```
User Input (Team Name, Slug)
    │
    ▼
┌──────────────────────┐
│ CreateTeam Component │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────┐
│ useAuth()              │
│ createTeam()           │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ teamService.createTeam │
└──────────┬─────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Insert into teams                │
│ - name, slug, owner_id, etc.     │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ RLS Check                        │
│ - Verify user is authenticated   │
│ - Create team as owner           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Insert into team_members         │
│ - Add owner to team              │
│ - Set role = owner               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ logAuditAction()                 │
│ - Record: team.created           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ authContext.loadTeams()          │
│ - Refresh user's team list       │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Success Response                 │
│ - Team ID, metadata              │
└──────────────────────────────────┘
```

### Team Invitation Flow

```
User Input (Email, Role)
    │
    ▼
┌──────────────────────────┐
│ TeamInvitations Component│
└──────────┬───────────────┘
           │
           ▼
┌────────────────────────────┐
│ useAuth()                  │
│ inviteTeamMember()         │
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ invitationService              │
│ inviteUserToTeam()             │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Generate Token                 │
│ - Cryptographically random     │
│ - URL-safe format              │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Insert into team_invitations   │
│ - email, token, expires_at     │
│ - status = pending             │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ RLS Check                      │
│ - Verify user is team admin    │
│ - Allow insertion              │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ logAuditAction()               │
│ - Record: invitation.sent      │
└──────────┬─────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Success Response               │
│ - Invitation ID, token         │
│ - Expiration date              │
└────────────────────────────────┘
           │
           ▼
┌────────────────────────────────┐
│ Recipient Flow (Accept)        │
│ 1. User receives invitation    │
│ 2. Clicks acceptance link      │
│ 3. acceptInvitation() called   │
│ 4. User added to team_members  │
│ 5. Invitation status = accepted│
│ 6. Audit logged                │
└────────────────────────────────┘
```

---

## Service Dependencies

```
AuthContext
    │
    ├─► authService
    │       ├─► supabase.auth
    │       ├─► profileService
    │       └─► auditService
    │
    ├─► teamService
    │       ├─► supabase (team_members)
    │       ├─► supabase (teams)
    │       └─► auditService
    │
    ├─► invitationService
    │       ├─► supabase (team_invitations)
    │       ├─► teamService
    │       └─► auditService
    │
    ├─► profileService
    │       ├─► supabase (profiles)
    │       └─► auditService
    │
    └─► auditService
            └─► supabase (audit_logs)
```

---

## Database Schema Relationships

```
┌─────────────────────────────┐
│   supabase.auth.users       │
│   (Managed by Supabase)     │
└────────────────┬────────────┘
                 │ user_id FK
                 ▼
    ┌────────────────────┐
    │     profiles       │
    ├─────────────────┬──┤
    │ id (PK)         │  │
    │ user_id (FK)    │  │
    │ email           │  │
    │ full_name       │  │
    │ username        │  │
    │ bio             │  │
    │ avatar_url      │  │
    │ is_active       │  │
    └────────┬────────┴──┘
             │
             │ user_id FK (in team_members)
             ▼
    ┌────────────────────┐
    │  team_members      │
    ├────────────────┬───┤
    │ id (PK)        │   │
    │ user_id (FK)   │   │
    │ team_id (FK)   │   ├──────────────┐
    │ role           │   │              │
    │ permissions    │   │              │
    │ joined_at      │   │              │
    └────────┬───────┴───┘              │
             │                          │
             │ team_id FK               │
             │                          │
             ▼                          ▼
    ┌────────────────────┐    ┌────────────────────┐
    │  team_invitations  │    │      teams         │
    ├────────────────┬───┤    ├────────────────┬───┤
    │ id (PK)        │   │    │ id (PK)        │   │
    │ team_id (FK)   ├───┤    │ owner_id (FK)  ├───┤
    │ email          │   │    │ name           │   │
    │ role           │   │    │ slug           │   │
    │ token          │   │    │ description    │   │
    │ status         │   │    │ logo_url       │   │
    │ invited_by     │   │    │ is_active      │   │
    │ expires_at     │   │    │ created_at     │   │
    └────────┬───────┴───┘    │ updated_at     │   │
             │                └────────┬────────┴───┘
             │                         │
             │ team_id FK              │
             │                         │
             └──────────────┬──────────┘
                            │
                            ▼
                ┌────────────────────┐
                │   audit_logs       │
                ├────────────────┬───┤
                │ id (PK)        │   │
                │ team_id (FK)   │   │
                │ user_id (FK)   │   │
                │ action         │   │
                │ resource_type  │   │
                │ resource_id    │   │
                │ changes        │   │
                │ ip_address     │   │
                │ user_agent     │   │
                │ created_at     │   │
                └────────────────┴───┘
```

---

## Security Architecture

### Row Level Security (RLS)

```
┌──────────────────────────────────┐
│       PostgreSQL RLS             │
├──────────────────────────────────┤
│ profiles                         │
│ ├─ SELECT: All users            │
│ ├─ INSERT: Own profile only      │
│ └─ UPDATE: Own profile only      │
├──────────────────────────────────┤
│ teams                            │
│ ├─ SELECT: Own teams via members│
│ ├─ INSERT: Authenticated users   │
│ └─ UPDATE: Owners only           │
├──────────────────────────────────┤
│ team_members                     │
│ ├─ SELECT: Own team members     │
│ ├─ INSERT: Admins only          │
│ ├─ UPDATE: Admins only          │
│ └─ DELETE: Owners only          │
├──────────────────────────────────┤
│ team_invitations                 │
│ ├─ SELECT: Email or admin       │
│ ├─ INSERT: Admins only          │
│ └─ UPDATE: Self status only     │
├──────────────────────────────────┤
│ audit_logs                       │
│ ├─ SELECT: Admins only          │
│ └─ INSERT: Service role only    │
└──────────────────────────────────┘
```

### Permission Model

```
┌────────────────────────────────┐
│        RBAC Hierarchy          │
├────────────────────────────────┤
│ owner                          │
│ ├─ Manage team settings        │
│ ├─ Manage all members          │
│ ├─ Manage billing              │
│ ├─ Delete team                 │
│ └─ All permissions             │
├────────────────────────────────┤
│ admin                          │
│ ├─ Manage members (except own) │
│ ├─ Send invitations            │
│ ├─ View analytics              │
│ └─ No billing access           │
├────────────────────────────────┤
│ member                         │
│ ├─ View analytics              │
│ ├─ Read data                   │
│ └─ Limited write access        │
├────────────────────────────────┤
│ guest                          │
│ ├─ View only access            │
│ └─ No write permissions        │
└────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├─ AuthProvider
│  │
│  ├─ ProtectedRoute
│  │  └─ Dashboard
│  │     ├─ DashboardLayout
│  │     │  └─ TeamSettings
│  │     │     ├─ Tabs
│  │     │     │  ├─ ProfileSettings
│  │     │     │  ├─ CreateTeam
│  │     │     │  ├─ TeamInvitations
│  │     │     │  └─ TeamMembers
│  │     │     └─ SignOut Button
│  │     │
│  │     └─ Other Dashboard Pages
│  │        ├─ DashboardOverview
│  │        ├─ DashboardBilling
│  │        └─ DashboardUsage
│  │
│  └─ AuthPages
│     ├─ LoginPage
│     └─ SignUpPage
```

---

## State Management Flow

```
Browser Storage (localStorage)
    │
    ├─► JWT Token (from Supabase)
    │
    ▼
AuthContext
    │
    ├─► user: User | null
    │   └─ Set on auth state change
    │
    ├─► session: Session | null
    │   └─ Updated on login/logout
    │
    ├─► profile: UserProfile | null
    │   └─ Loaded from profiles table
    │
    ├─► currentTeam: Team | null
    │   └─ Selected/first team
    │
    ├─► teams: Team[]
    │   └─ Fetched from team_members join teams
    │
    ├─► teamMember: TeamMember | null
    │   └─ Current user's membership data
    │
    ├─► subscription: SubscriptionState
    │   └─ Refreshed from Stripe/Edge Function
    │
    └─► loading: boolean
        └─ Set during async operations
```

---

## Event Flow

```
User Action (Click, Form Submit)
    │
    ▼
Component Event Handler
    │
    ├─► useAuth() Hook
    │   │
    │   └─► AuthContext Method
    │       │
    │       ├─► Set loading = true
    │       │
    │       └─► Call Service Function
    │           │
    │           ├─► Service validates input
    │           │
    │           ├─► Supabase call
    │           │   │
    │           │   ├─► RLS Check
    │           │   │
    │           │   └─► Execute Query
    │           │       └─► Trigger Audit Log
    │           │
    │           └─► Return Result
    │
    ├─► Update State
    │   ├─► User feedback (toast, error message)
    │   ├─► Trigger re-render
    │   └─► Set loading = false
    │
    └─► Optional: Refresh Related Data
        ├─► loadTeams()
        ├─► loadProfile()
        └─► refreshSubscription()
```

---

## Error Handling Strategy

```
Service Function
    │
    ├─ Input Validation
    │  └─► Throw validation error
    │
    ├─ Supabase Call
    │  │
    │  ├─ RLS Rejection
    │  │  └─► "Not authenticated" / "Permission denied"
    │  │
    │  ├─ Constraint Violation
    │  │  └─► "Team slug must be unique"
    │  │
    │  └─ Connection Error
    │     └─► "Failed to execute query"
    │
    └─► Catch & Throw
       └─► Descriptive error message
           │
           └─► Component catches & displays
               ├─► Toast notification
               ├─► Error message
               └─► User retry option
```

---

## Security Considerations

### Authentication
- ✅ JWT tokens stored in localStorage (configurable)
- ✅ Secure password hashing via Supabase Auth
- ✅ Token refresh on route change
- ✅ Automatic logout on session expiry

### Authorization
- ✅ RLS policies on all tables
- ✅ Role-based access control (RBAC)
- ✅ Team isolation at database level
- ✅ Permission-based operation gating

### Audit & Compliance
- ✅ All user actions logged
- ✅ IP address and user agent tracked
- ✅ Change deltas stored (before/after)
- ✅ Audit logs queryable by user/team/action

### Data Protection
- ✅ Encrypted data in transit (HTTPS)
- ✅ Encrypted data at rest (PostgreSQL)
- ✅ No sensitive data in client storage
- ✅ Email verification for new accounts

---

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - User profile cached in AuthContext
   - Team list cached and refreshed on demand
   - Subscription state auto-refreshes every 60s

2. **Query Optimization**
   - Select only needed columns
   - Use indexes on foreign keys
   - Batch operations where possible

3. **Component Optimization**
   - React Context prevents prop drilling
   - useCallback prevents unnecessary re-renders
   - Lazy loading for heavy components

4. **Network**
   - Service layer abstracts Supabase calls
   - Single round-trip for multi-table queries
   - Real-time subscriptions available

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase RLS policies enforced
- [ ] Audit logging enabled
- [ ] Email verification required
- [ ] Password reset configured
- [ ] Session timeout configured
- [ ] SSL/TLS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error monitoring setup

---

**End of Architecture Guide**
