
-- ============================================
-- Gold Mail Validator - Database Schema Completo
-- ============================================

-- 1. BULK JOBS - Track bulk validation uploads
CREATE TABLE public.bulk_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_format TEXT NOT NULL CHECK (file_format IN ('csv', 'txt', 'xlsx')),
  total_emails INTEGER NOT NULL DEFAULT 0,
  processed INTEGER NOT NULL DEFAULT 0,
  valid_count INTEGER NOT NULL DEFAULT 0,
  invalid_count INTEGER NOT NULL DEFAULT 0,
  catch_all_count INTEGER NOT NULL DEFAULT 0,
  risky_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  webhook_url TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bulk_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bulk jobs" ON public.bulk_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bulk jobs" ON public.bulk_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bulk jobs" ON public.bulk_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_bulk_jobs_updated_at
  BEFORE UPDATE ON public.bulk_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. VALIDATION RESULTS - Individual email validation results
CREATE TABLE public.validation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  bulk_job_id UUID REFERENCES public.bulk_jobs(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('valid', 'invalid', 'catch-all', 'temporary', 'risky', 'pending')),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  mx_check BOOLEAN DEFAULT false,
  smtp_check BOOLEAN DEFAULT false,
  disposable BOOLEAN DEFAULT false,
  role_based BOOLEAN DEFAULT false,
  free_provider BOOLEAN DEFAULT false,
  domain_reputation TEXT DEFAULT 'medium' CHECK (domain_reputation IN ('low', 'medium', 'high')),
  checks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can view validation results" ON public.validation_results
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = validation_results.tenant_id AND tenants.owner_id = auth.uid()
  ));

CREATE POLICY "Tenant owners can insert validation results" ON public.validation_results
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = validation_results.tenant_id AND tenants.owner_id = auth.uid()
  ));

CREATE INDEX idx_validation_results_tenant ON public.validation_results(tenant_id);
CREATE INDEX idx_validation_results_bulk_job ON public.validation_results(bulk_job_id);
CREATE INDEX idx_validation_results_status ON public.validation_results(status);

-- 3. SUBSCRIPTIONS - Plan subscriptions per tenant
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'paused')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. CREDITS - Credit balance and transactions
CREATE TABLE public.credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  last_refill_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON public.credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON public.credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_credits_updated_at
  BEFORE UPDATE ON public.credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE UNIQUE INDEX idx_credits_tenant_user ON public.credits(tenant_id, user_id);

-- 5. AGENTS LOGS - Agent activity logs (backend only)
CREATE TABLE public.agents_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agents_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owners can view agent logs" ON public.agents_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = agents_logs.tenant_id AND tenants.owner_id = auth.uid()
  ));

CREATE INDEX idx_agents_logs_tenant ON public.agents_logs(tenant_id);
CREATE INDEX idx_agents_logs_agent ON public.agents_logs(agent_id);
CREATE INDEX idx_agents_logs_created ON public.agents_logs(created_at DESC);
