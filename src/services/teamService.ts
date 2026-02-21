import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "guest";
  permissions: Record<string, boolean>;
  joined_at: string;
  updated_at: string;
}

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

// Create a new team
export async function createTeam(
  userId: string,
  data: { name: string; slug: string; description?: string; logo_url?: string }
): Promise<Team> {
  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      logo_url: data.logo_url || null,
      owner_id: userId,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create team: ${error.message}`);

  // Add owner as team member
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: userId,
    role: "owner",
    permissions: { all: true },
  });

  if (memberError) throw new Error(`Failed to add owner as team member: ${memberError.message}`);

  return team;
}

// Get user's teams
export async function getUserTeams(userId: string): Promise<Team[]> {
  // First get team IDs where user is a member
  const { data: members, error: memberError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId);

  if (memberError) throw new Error(`Failed to fetch user teams: ${memberError.message}`);

  if (!members || members.length === 0) return [];

  const teamIds = members.map((m) => m.team_id);

  // Get team details
  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .in("id", teamIds)
    .eq("is_active", true);

  if (teamError) throw new Error(`Failed to fetch teams: ${teamError.message}`);

  return teams || [];
}

// Get team details
export async function getTeam(teamId: string): Promise<Team> {
  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (error) throw new Error(`Failed to fetch team: ${error.message}`);

  return team;
}

// Update team
export async function updateTeam(
  teamId: string,
  updates: Partial<Omit<Team, "id" | "owner_id" | "created_at" | "updated_at">>
): Promise<Team> {
  const { data: team, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update team: ${error.message}`);

  return team;
}

// Delete team (soft delete)
export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase.from("teams").update({ is_active: false }).eq("id", teamId);

  if (error) throw new Error(`Failed to delete team: ${error.message}`);
}

// Get team members
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data: members, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId);

  if (error) throw new Error(`Failed to fetch team members: ${error.message}`);

  return members || [];
}

// Get team member
export async function getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
  const { data: member, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch team member: ${error.message}`);
  }

  return member || null;
}

// Check if user is team owner
export async function isTeamOwner(teamId: string, userId: string): Promise<boolean> {
  const member = await getTeamMember(teamId, userId);
  return member?.role === "owner";
}

// Check if user is team admin or owner
export async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
  const member = await getTeamMember(teamId, userId);
  return member?.role === "owner" || member?.role === "admin";
}

// Update team member role
export async function updateTeamMemberRole(
  memberId: string,
  role: "owner" | "admin" | "member" | "guest"
): Promise<TeamMember> {
  const { data: member, error } = await supabase
    .from("team_members")
    .update({ role })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update team member role: ${error.message}`);

  return member;
}

// Remove team member
export async function removeTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase.from("team_members").delete().eq("id", memberId);

  if (error) throw new Error(`Failed to remove team member: ${error.message}`);
}
