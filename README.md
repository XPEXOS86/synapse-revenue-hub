# GoldMail AI - Email Intelligence Platform

## Overview

**GoldMail AI** is an autonomous email intelligence agent built on the **XPEX SYSTEMS AI** ecosystem. It provides enterprise-grade email validation, deliverability analysis, and compliance tracking powered by artificial intelligence.

### Current Status: GoldMail AI Restructuring Complete ✅

**Complete Restructuring:**
- All legacy modules removed (Shield, Connect, Insight, Automate, Marketplace)
- Focused landing page for GoldMail AI
- Production authentication system (Phases 1-3)
- Team management & RBAC infrastructure
- Email validation dashboard
- Live sandbox for testing
- Pricing page with tiers
- API documentation framework

**Key Infrastructure Retained:**
- Complete auth system (Phases 1-3)
- 7 database tables with RLS policies
- 7 services (auth, profile, team, invitation, audit, permission, role)
- RBAC with 23 granular permissions

## Project Info

**Repository**: XPEXOS86/synapse-revenue-hub  
**Branch**: v0/xpexos86-2780b578  
**Latest Update**: 2026-02-21 (GoldMail AI Restructuring)

## Quick Start

### Available Pages

**Public Pages:**
- `/` - GoldMail AI landing page
- `/sandbox` - Live email validation tester
- `/pricing` - SaaS pricing tiers
- `/api` - API documentation
- `/auth` - Sign up & login

**Protected Pages:**
- `/dashboard` - User dashboard
- `/dashboard/usage` - API usage statistics
- `/dashboard/billing` - Subscription management
- `/dashboard/keys` - API key management

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Features

### Email Validation
- Real-time email verification
- Deliverability scoring
- Risk assessment
- SMTP validation

### API Integration
- REST API with authentication
- Webhook support
- Batch processing
- Rate limiting

### Authentication & Team Management
- Email/password authentication
- OAuth (GitHub, Google)
- Multi-team support
- Role-based access control
- RBAC with 23 granular permissions

### Security & Compliance
- Row-level security (RLS)
- Audit logging on all operations
- GDPR-ready data handling
- Enterprise SLA support

## Architecture

```
Frontend: React + Vite + TypeScript
UI Framework: shadcn/ui + Tailwind CSS
Backend: Supabase + PostgreSQL
Auth: Supabase Auth + Custom session management
State: React Context + TanStack Query
```

## Authentication Documentation

The authentication system includes:
- 7 database tables with RLS policies
- 7 services (auth, profile, team, invitation, audit, permission, role)
- 4 custom React hooks
- Complete RBAC implementation

See [QUICK_START.md](./QUICK_START.md) for usage examples.

## How can I edit this code?

### Authentication
- Email/password sign up and sign in
- OAuth provider support (GitHub, Google)
- Magic link (passwordless) authentication
- Password reset and update flows
- Session management with auto-refresh
- Multi-team support
- Role-based access control

### Team Management
- Create and manage teams
- Switch between multiple teams
- Team metadata (name, slug, description)
- Invite members via email
- Role-based permissions

### Dashboard
- Email validation statistics
- API usage tracking
- Subscription management
- API key generation and management
- Usage analytics

### Security & Compliance
- Row-level security (RLS) on all tables
- Complete audit logging
- GDPR-ready data handling
- Enterprise encryption
- Rate limiting

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite + React + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase + PostgreSQL
- **Auth**: Supabase Auth + Custom Auth Context
- **State Management**: React Context + TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React

## How can I deploy this project?

1. **Push to GitHub**: All changes are automatically synced
2. **Deploy to Vercel**: Click "Publish" in the project settings
3. **Custom Domain**: Go to Project > Settings > Domains

## Documentation Files

- **QUICK_START.md** - Getting started guide
- **ARCHITECTURE.md** - System design overview
- **PHASE_1_2_IMPLEMENTATION.md** - Auth system details
- **PHASE_3_IMPLEMENTATION.md** - RBAC system details
- **AUDIT_REPORT.md** - Complete system audit

## Support

For issues or questions:
- Check existing documentation
- Review code comments
- Contact development team
