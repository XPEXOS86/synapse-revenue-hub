
-- Create system_events table
CREATE TABLE public.system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('api','webhook','system','agent')),
  request_id UUID NOT NULL,
  correlation_id TEXT,
  actor_user_id UUID,
  function_name TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('started','completed','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_system_events_tenant ON public.system_events(tenant_id);
CREATE INDEX idx_system_events_request ON public.system_events(request_id);
CREATE INDEX idx_system_events_correlation ON public.system_events(correlation_id);
CREATE INDEX idx_system_events_type ON public.system_events(event_type);
CREATE INDEX idx_system_events_created ON public.system_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- RLS: Tenant owners can view their system events
CREATE POLICY "Tenant owners can view system events"
ON public.system_events
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tenants
  WHERE tenants.id = system_events.tenant_id
  AND tenants.owner_id = auth.uid()
));

-- RLS: Service role inserts (no user INSERT policy needed, edge functions use service role)

-- Add request_id to usage_logs
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS request_id UUID;

-- Add request_id to agents_logs
ALTER TABLE public.agents_logs ADD COLUMN IF NOT EXISTS request_id UUID;
