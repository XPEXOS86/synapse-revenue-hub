
-- Add async worker columns to bulk_jobs
ALTER TABLE public.bulk_jobs
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_error TEXT,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS worker_id TEXT;

CREATE INDEX IF NOT EXISTS idx_bulk_jobs_status ON public.bulk_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_locked_at ON public.bulk_jobs(locked_at);

-- Create bulk_inputs queue table
CREATE TABLE IF NOT EXISTS public.bulk_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_job_id UUID NOT NULL REFERENCES public.bulk_jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  email TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bulk_inputs ENABLE ROW LEVEL SECURITY;

-- RLS: tenant owners can view their inputs
CREATE POLICY "Tenant owners can view bulk inputs"
ON public.bulk_inputs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM tenants WHERE tenants.id = bulk_inputs.tenant_id AND tenants.owner_id = auth.uid()
));

CREATE INDEX IF NOT EXISTS idx_bulk_inputs_job ON public.bulk_inputs(bulk_job_id);
CREATE INDEX IF NOT EXISTS idx_bulk_inputs_processed ON public.bulk_inputs(bulk_job_id, processed);
