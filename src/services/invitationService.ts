import { supabase } from "@/integrations/supabase/client";

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: "owner" | "admin" | "member" | "guest";
  token: string;
  status: "pending" | "accepted" | "declined" | "expired";
  invited_by: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

// Generate invite token
function generateInviteToken(): string {
  return `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
}

// Invite user to team
export async function inviteUserToTeam(
  teamId: string,
  email: string,
  role: "owner" | "admin" | "member" | "guest",
  invitedBy: string,
  expirationDays: number = 7
): Promise<TeamInvitation> {
  const token = generateInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .insert({
      team_id: teamId,
      email,
      role,
      token,
      status: "pending",
      invited_by: invitedBy,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create invitation: ${error.message}`);

  return invitation;
}

// Get invitation by token
export async function getInvitationByToken(token: string): Promise<TeamInvitation | null> {
  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch invitation: ${error.message}`);
  }

  if (!invitation) return null;

  // Check if invitation has expired
  const expiresAt = new Date(invitation.expires_at);
  if (expiresAt < new Date()) {
    return null; // Invitation expired
  }

  return invitation;
}

// Accept invitation
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<TeamInvitation> {
  const { data: invitation, error: fetchError } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (fetchError) throw new Error(`Failed to fetch invitation: ${fetchError.message}`);

  if (invitation.status !== "pending") {
    throw new Error("Invitation is not pending");
  }

  // Add user to team
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: invitation.team_id,
    user_id: userId,
    role: invitation.role,
    permissions: getDefaultPermissions(invitation.role),
  });

  if (memberError) throw new Error(`Failed to add team member: ${memberError.message}`);

  // Update invitation status
  const { data: updatedInvitation, error: updateError } = await supabase
    .from("team_invitations")
    .update({ status: "accepted" })
    .eq("id", invitationId)
    .select()
    .single();

  if (updateError) throw new Error(`Failed to update invitation: ${updateError.message}`);

  return updatedInvitation;
}

// Decline invitation
export async function declineInvitation(invitationId: string): Promise<TeamInvitation> {
  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .update({ status: "declined" })
    .eq("id", invitationId)
    .select()
    .single();

  if (error) throw new Error(`Failed to decline invitation: ${error.message}`);

  return invitation;
}

// Get user's pending invitations
export async function getUserPendingInvitations(email: string): Promise<TeamInvitation[]> {
  const { data: invitations, error } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("email", email)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (error) throw new Error(`Failed to fetch invitations: ${error.message}`);

  return invitations || [];
}

// Get team invitations
export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const { data: invitations, error } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", teamId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (error) throw new Error(`Failed to fetch team invitations: ${error.message}`);

  return invitations || [];
}

// Cancel invitation
export async function cancelInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from("team_invitations")
    .update({ status: "declined" })
    .eq("id", invitationId);

  if (error) throw new Error(`Failed to cancel invitation: ${error.message}`);
}

// Get default permissions based on role
function getDefaultPermissions(role: "owner" | "admin" | "member" | "guest"): Record<string, boolean> {
  const permissions: Record<string, Record<string, boolean>> = {
    owner: {
      all: true,
      manage_team: true,
      manage_members: true,
      manage_billing: true,
      view_analytics: true,
    },
    admin: {
      manage_team: true,
      manage_members: true,
      view_analytics: true,
    },
    member: {
      view_analytics: true,
    },
    guest: {
      view_only: true,
    },
  };

  return permissions[role] || {};
}
