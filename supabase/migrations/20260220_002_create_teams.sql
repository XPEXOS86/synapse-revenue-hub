-- Phase 1: Create Teams Table (OpenClaw Authentication System)
-- Teams are workspaces where multiple users can collaborate

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_slug ON public.teams(slug);
CREATE INDEX idx_teams_is_active ON public.teams(is_active);

-- Enable RLS on teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
-- Team members can view their teams
CREATE POLICY "Team members can view their teams" ON public.teams FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = id
    )
    OR owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Owners can update their teams
CREATE POLICY "Team owners can update their teams" ON public.teams FOR UPDATE
  USING (owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Owners can delete their teams
CREATE POLICY "Team owners can delete their teams" ON public.teams FOR DELETE
  USING (owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Authenticated users can insert new teams
CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT
  WITH CHECK (owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger to update updated_at on teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
