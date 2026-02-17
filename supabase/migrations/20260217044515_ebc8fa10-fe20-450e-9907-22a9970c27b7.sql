
-- Add function_name column (already exists in schema but adding IF NOT EXISTS for safety)
ALTER TABLE public.system_events ADD COLUMN IF NOT EXISTS function_name TEXT;

-- Add idempotency_key for future Stripe/webhook protection
ALTER TABLE public.system_events ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Add indexes for observability queries
CREATE INDEX IF NOT EXISTS idx_system_events_function_name ON public.system_events(function_name);
CREATE INDEX IF NOT EXISTS idx_system_events_status ON public.system_events(status);
CREATE INDEX IF NOT EXISTS idx_system_events_created_desc ON public.system_events(created_at DESC);
