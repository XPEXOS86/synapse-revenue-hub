# OpenClaw Authentication System - Deployment Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Supabase project created and configured
- [ ] Environment variables defined in `.env.local`:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
  ```
- [ ] GitHub repository connected to Vercel
- [ ] Database backups configured

### Code Review
- [ ] All migrations reviewed and tested
- [ ] RLS policies reviewed for correctness
- [ ] Service layer error handling verified
- [ ] Components tested in local environment
- [ ] TypeScript compilation passes
- [ ] No console errors in development

### Database Preparation
- [ ] Staging database created
- [ ] All migrations applied to staging
- [ ] RLS policies tested in staging
- [ ] Test data created
- [ ] Audit logs verified

---

## Deployment Steps

### Step 1: Deploy to Staging

```bash
# 1. Clone and setup
git clone https://github.com/XPEXOS86/synapse-revenue-hub.git
cd synapse-revenue-hub
git checkout v0/xpexos86-2780b578
npm install

# 2. Configure staging environment
# Create .env.staging.local with staging Supabase credentials
cp .env.local .env.staging.local

# 3. Run migrations on staging
npm run migrate:staging

# 4. Run tests
npm run test

# 5. Build and preview
npm run build
npm run preview
```

### Step 2: Test in Staging

**Authentication Testing:**
```
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign out
- [ ] Password reset flow
- [ ] Magic link authentication
- [ ] OAuth provider (GitHub, Google)
```

**Team Testing:**
```
- [ ] Create team
- [ ] Invite team member
- [ ] Accept invitation
- [ ] Update member role
- [ ] Remove member
- [ ] Switch between teams
```

**Audit Testing:**
```
- [ ] Verify audit logs created
- [ ] Check IP address tracking
- [ ] Verify user agent capture
- [ ] Test audit log queries
```

### Step 3: Deploy to Production

**Option A: Vercel Deployment (Recommended)**
```bash
# Push to main branch (triggers auto-deployment)
git push origin main

# Or manually deploy from Vercel dashboard:
# 1. Go to vercel.com
# 2. Select your project
# 3. Click "Deploy"
# 4. Wait for build to complete
```

**Option B: Manual Deployment**
```bash
# 1. Set production environment variables
# In Vercel Dashboard: Settings → Environment Variables
# Add all required variables from .env.local

# 2. Deploy
vercel --prod

# 3. Verify deployment
# Visit deployed URL
# Check that all features work
```

### Step 4: Run Production Migrations

```bash
# 1. Backup production database
# In Supabase dashboard: Database → Backups → Create

# 2. Apply migrations to production
# Option A: Use Supabase CLI
supabase db push --linked

# Option B: Use Supabase dashboard
# Go to SQL Editor → Run each migration file

# 3. Verify migrations
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Step 5: Post-Deployment Verification

**Database Check:**
```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Application Check:**
- [ ] Homepage loads without errors
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Profile page loads
- [ ] Can create team
- [ ] Can invite member
- [ ] Audit logs appear in database
- [ ] No console errors in browser
- [ ] Mobile responsiveness works

**Monitoring:**
- [ ] Error tracking enabled (Sentry/LogRocket)
- [ ] Performance monitoring setup
- [ ] Email delivery verified
- [ ] Webhooks functioning
- [ ] Real-time subscriptions working

---

## Database Migration Details

### Production Migration Order

**IMPORTANT**: Always run migrations in this order:

1. `20260220_000_create_base_functions.sql`
   - Creates utility functions
   - **No data dependencies**

2. `20260220_001_create_profiles.sql`
   - Creates profiles table
   - **Depends on**: Supabase Auth users

3. `20260220_002_create_teams.sql`
   - Creates teams table
   - **Depends on**: profiles table

4. `20260220_003_create_team_members.sql`
   - Creates team_members table
   - **Depends on**: profiles, teams

5. `20260220_004_create_team_invitations.sql`
   - Creates team_invitations table
   - **Depends on**: teams, profiles

6. `20260220_005_create_audit_logs.sql`
   - Creates audit_logs table
   - **Depends on**: teams, profiles

### Migration Rollback Plan

If migrations fail:

```sql
-- Option 1: Drop tables (if not in production)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Option 2: Restore from backup
-- In Supabase: Database → Backups → Restore

-- Then re-run migrations
```

### Production Data Safety

```sql
-- Backup user data before migration
CREATE TABLE profiles_backup AS SELECT * FROM profiles;
CREATE TABLE teams_backup AS SELECT * FROM teams;
CREATE TABLE team_members_backup AS SELECT * FROM team_members;

-- Verify backup
SELECT COUNT(*) FROM profiles_backup;
SELECT COUNT(*) FROM teams_backup;

-- After migration succeeds, can delete backups
DROP TABLE profiles_backup;
DROP TABLE teams_backup;
DROP TABLE team_members_backup;
```

---

## Environment Variables

### Development
```
VITE_SUPABASE_URL=https://dev.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=dev-key
```

### Staging
```
VITE_SUPABASE_URL=https://staging.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=staging-key
```

### Production
```
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=prod-key
```

All keys available in Supabase Dashboard: Settings → API

---

## Monitoring & Health Checks

### Daily Checks
```bash
# Check error rates
curl https://api.sentry.io/api/0/projects/{org}/{project}/stats/

# Check database connection
SELECT NOW();

# Check auth status
curl -X GET https://your-app.vercel.app/api/health
```

### Weekly Checks
```sql
-- Check audit log growth
SELECT DATE_TRUNC('day', created_at), COUNT(*) 
FROM audit_logs 
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY 1 DESC
LIMIT 7;

-- Check active users
SELECT COUNT(DISTINCT user_id) 
FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '7 days';

-- Check storage usage
SELECT SUM(CAST(pg_total_relation_size(schemaname||'.'||tablename) AS numeric)) / 1024 / 1024 as size_mb 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Monthly Checks
```sql
-- Review RLS policies for changes
SELECT schemaname, tablename, policyname, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check for slow queries
SELECT query, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Analyze table sizes
SELECT tablename, 
       ROUND(CAST(pg_total_relation_size(schemaname||'.'||tablename) AS numeric) / 1024 / 1024, 2) as size_mb
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Troubleshooting Deployment Issues

### Issue: Migrations Fail

**Symptoms**: 
- Deployment fails with SQL error
- "Relation already exists"

**Solutions**:
```sql
-- Check if tables exist
\dt

-- If they exist, either:
-- 1. Drop and re-run migrations
DROP TABLE profile CASCADE;
-- 2. Or modify migrations to use "CREATE TABLE IF NOT EXISTS"

-- Verify migration state
SELECT * FROM migrations;
```

### Issue: RLS Policies Too Restrictive

**Symptoms**:
- "permission denied" errors
- Users can't access own data

**Solutions**:
```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Temporarily disable RLS for debugging
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Review and fix policy
CREATE POLICY "Users can select own profile" ON profiles
FOR SELECT USING (user_id = auth.uid());

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Issue: Supabase Connection Error

**Symptoms**:
- "Failed to fetch" errors
- Blank pages

**Solutions**:
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_KEY

# Test Supabase connection
curl https://<your-project>.supabase.co/rest/v1/

# Check Supabase status
# Visit https://status.supabase.com/
```

### Issue: JWT Token Invalid

**Symptoms**:
- "Invalid token" errors
- Can't stay signed in

**Solutions**:
```bash
# Verify JWT secret matches
# In Supabase: Settings → API → JWT Secret

# Check token expiration
# Default: 1 hour

# Verify CORS settings
# In Supabase: Settings → CORS

# Clear browser storage
# localStorage.clear()
# sessionStorage.clear()
```

---

## Rollback Procedure

If production deployment fails:

### Option 1: Revert Code
```bash
# If deployed via Vercel
# 1. Go to Vercel dashboard
# 2. Select deployment
# 3. Click "Rollback"

# If deployed via git
git revert <commit-hash>
git push origin main
```

### Option 2: Restore Database
```bash
# In Supabase Dashboard:
# 1. Database → Backups
# 2. Select desired backup
# 3. Click "Restore"
# 4. Verify restoration
```

### Option 3: Manual Fix
```bash
# If only data issues:
UPDATE profiles SET updated_at = NOW() WHERE is_active = false;

# If migrations failed:
# Follow "Migration Rollback Plan" above
```

---

## Performance Optimization

### Database Optimization
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_audit_logs_team_id ON audit_logs(team_id);
```

### Cache Strategy
```typescript
// In AuthContext
const CACHE_DURATION = 60000; // 1 minute
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh user data
    loadProfile();
    loadTeams();
  }, CACHE_DURATION);
  
  return () => clearInterval(interval);
}, []);
```

### Query Optimization
```typescript
// Use select() to specify columns
const { data } = await supabase
  .from('teams')
  .select('id, name, slug') // Only needed columns
  .eq('owner_id', userId);
```

---

## Security Checklist

- [ ] All RLS policies reviewed and tested
- [ ] CORS configured for production domain
- [ ] SSL/TLS enforced on all connections
- [ ] Environment variables stored securely
- [ ] API rate limiting configured
- [ ] Error messages don't leak sensitive info
- [ ] Audit logs are immutable
- [ ] Password reset tokens are short-lived
- [ ] Session tokens are secure
- [ ] Input validation on all APIs

---

## Support & Contact

For deployment issues:
1. Check TROUBLESHOOTING section above
2. Review Supabase documentation
3. Check Vercel dashboard for build logs
4. Review browser console for client errors
5. Check server logs for backend errors

---

## Deployment Sign-Off

- [ ] All tests pass
- [ ] Code reviewed and approved
- [ ] Staging deployment successful
- [ ] Production migrations verified
- [ ] Health checks passing
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Documentation updated

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Approval**: _______________

---

**End of Deployment Guide**
