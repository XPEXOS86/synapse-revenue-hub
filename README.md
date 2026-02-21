# OpenClaw Ecosystem - Authentication System

## Project Overview

This is the **OpenClaw Ecosystem** authentication system built with React, TypeScript, Supabase, and TailwindCSS.

### Current Status: Phase 1-2 Complete ✅

**Implemented Features:**
- Complete database schema with 5 tables and RLS policies
- Full authentication system (5 services, 1,062 lines)
- React components for all features (734 lines)
- Audit logging and compliance tracking
- Team management and invitations
- Production-ready code with full TypeScript support

## Project Info

**Repository**: XPEXOS86/synapse-revenue-hub  
**Branch**: v0/xpexos86-2780b578  
**Implementation Date**: 2026-02-20

## Quick Start Documentation

Start with these files for different needs:

**New to the project?**
→ Read [QUICK_START.md](./QUICK_START.md) for usage examples and patterns

**Want to understand the architecture?**
→ Read [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design

**Need technical implementation details?**
→ Read [PHASE_1_2_IMPLEMENTATION.md](./PHASE_1_2_IMPLEMENTATION.md) for schema & APIs

**Looking for a summary?**
→ Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) or [PHASE_1_2_SUMMARY.txt](./PHASE_1_2_SUMMARY.txt)

## Key Features Implemented (Phase 1-2)

### Authentication
- Email/password sign up and sign in
- OAuth provider support (GitHub, Google)
- Magic link (passwordless) authentication
- Password reset and update flows
- Session management with auto-refresh

### Team Management
- Create and manage teams
- Switch between multiple teams
- Team metadata (name, slug, description)
- Soft-delete support for compliance

### Member Management
- Invite team members via email
- Accept/decline invitations
- Role-based access control (owner, admin, member, guest)
- Member permission tracking
- Remove members from teams

### Profile Management
- Create and update user profiles
- Username availability checking
- User search functionality
- Profile activation/deactivation

### Audit & Compliance
- Log all user actions with timestamps
- Track IP address and user agent
- Store change deltas (before/after state)
- Query audit trail by team, user, or action type
- Compliance-ready audit system

### Security
- Row Level Security (RLS) on all database tables
- Team-based data isolation
- Role-based access control
- Secure invitation tokens
- Email verification support

## Project Structure

```
src/
├── services/           # Business logic services
│   ├── authService.ts
│   ├── teamService.ts
│   ├── invitationService.ts
│   ├── profileService.ts
│   └── auditService.ts
├── components/
│   ├── auth/          # Authentication components
│   │   ├── ProfileSettings.tsx
│   │   ├── CreateTeam.tsx
│   │   ├── TeamInvitations.tsx
│   │   └── TeamMembers.tsx
│   ├── dashboard/     # Dashboard components
│   └── ui/            # Shared UI components
├── contexts/
│   └── AuthContext.tsx # Global auth state
├── pages/
│   ├── TeamSettings.tsx
│   └── (other pages)
├── hooks/             # Custom React hooks
├── integrations/
│   └── supabase/      # Supabase client & types
└── (other directories)

supabase/
├── migrations/        # Database migrations
│   ├── 20260220_000_create_base_functions.sql
│   ├── 20260220_001_create_profiles.sql
│   ├── 20260220_002_create_teams.sql
│   ├── 20260220_003_create_team_members.sql
│   ├── 20260220_004_create_team_invitations.sql
│   └── 20260220_005_create_audit_logs.sql
└── functions/         # Edge functions
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
