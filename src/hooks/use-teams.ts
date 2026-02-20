import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreateTeamInput {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
}

interface InviteTeamMemberInput {
  email: string;
  role: "owner" | "admin" | "member" | "guest";
}

export function useTeams() {
  const { profile, currentTeam, loadTeams } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTeam = useCallback(
    async (input: CreateTeamInput) => {
      if (!profile) {
        setError(new Error("User profile not loaded"));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create team
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: input.name,
            slug: input.slug,
            description: input.description || null,
            logo_url: input.logo_url || null,
            owner_id: profile.id,
            is_active: true,
          })
          .select()
          .single();

        if (teamError) throw teamError;

        // Add owner as team member
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: teamData.id,
            user_id: profile.id,
            role: "owner",
            permissions: { all: true },
          });

        if (memberError) throw memberError;

        // Reload teams
        await loadTeams();

        return teamData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create team");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [profile, loadTeams]
  );

  const inviteTeamMember = useCallback(
    async (input: InviteTeamMemberInput) => {
      if (!currentTeam || !profile) {
        setError(new Error("Team or profile not loaded"));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Generate invite token
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

        const { data, error: inviteError } = await supabase
          .from("team_invitations")
          .insert({
            team_id: currentTeam.id,
            invited_by: profile.id,
            email: input.email,
            role: input.role,
            token,
            status: "pending",
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (inviteError) throw inviteError;

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to invite team member");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTeam, profile]
  );

  const updateTeamMemberRole = useCallback(
    async (memberId: string, role: "owner" | "admin" | "member" | "guest") => {
      if (!currentTeam) {
        setError(new Error("Team not loaded"));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from("team_members")
          .update({ role })
          .eq("id", memberId)
          .eq("team_id", currentTeam.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update team member");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTeam]
  );

  const removeTeamMember = useCallback(
    async (memberId: string) => {
      if (!currentTeam) {
        setError(new Error("Team not loaded"));
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("team_members")
          .delete()
          .eq("id", memberId)
          .eq("team_id", currentTeam.id);

        if (deleteError) throw deleteError;

        await loadTeams();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to remove team member");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTeam, loadTeams]
  );

  return {
    isLoading,
    error,
    createTeam,
    inviteTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
  };
}
