
-- Fix RLS: Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- ========== PROFILES ==========
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ========== TENANTS ==========
DROP POLICY IF EXISTS "Owners can manage tenants" ON public.tenants;

CREATE POLICY "Owners can view tenants" ON public.tenants
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert tenants" ON public.tenants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update tenants" ON public.tenants
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- ========== API_KEYS ==========
DROP POLICY IF EXISTS "Users can manage own api keys" ON public.api_keys;

CREATE POLICY "Users can view own api keys" ON public.api_keys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys" ON public.api_keys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON public.api_keys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ========== AGENTS ==========
DROP POLICY IF EXISTS "Tenant owners can manage agents" ON public.agents;

CREATE POLICY "Tenant owners can view agents" ON public.agents
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = agents.tenant_id AND tenants.owner_id = auth.uid()));

CREATE POLICY "Tenant owners can insert agents" ON public.agents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = agents.tenant_id AND tenants.owner_id = auth.uid()));

CREATE POLICY "Tenant owners can update agents" ON public.agents
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = agents.tenant_id AND tenants.owner_id = auth.uid()));

CREATE POLICY "Tenant owners can delete agents" ON public.agents
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = agents.tenant_id AND tenants.owner_id = auth.uid()));

-- ========== USAGE_LOGS ==========
DROP POLICY IF EXISTS "Tenant owners can view usage" ON public.usage_logs;

CREATE POLICY "Tenant owners can view usage" ON public.usage_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = usage_logs.tenant_id AND tenants.owner_id = auth.uid()));

-- ========== USER_ROLES ==========
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
