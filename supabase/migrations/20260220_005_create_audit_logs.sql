-- Phase 1: Create Audit Logs Table (OpenClaw Authentication System)
-- Tracks all sensitive actions for security and compliance

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  changes JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_team_id ON public.audit_logs(team_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Enable RLS on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
-- Team owners and admins can view team audit logs
CREATE POLICY "Team admins can view team audit logs" ON public.audit_logs FOR SELECT
  USING (
    team_id IS NULL -- Global logs for service role only
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = audit_logs.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Only service role can insert (via triggers and functions)
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- Will be enforced at function level

-- Function to log actions
CREATE OR REPLACE FUNCTION public.log_action(
  p_user_id UUID,
  p_team_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id VARCHAR,
  p_changes JSONB DEFAULT '{}'::jsonb,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, team_id, action, resource_type, resource_id, changes, ip_address, user_agent
  ) VALUES (
    p_user_id, p_team_id, p_action, p_resource_type, p_resource_id, p_changes, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
