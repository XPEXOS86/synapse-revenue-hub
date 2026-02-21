import { supabase } from "@/integrations/supabase/client";
import { logAuditAction, AuditActions } from "./auditService";

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return profile || null;
}

// Create user profile
export async function createUserProfile(
  userId: string,
  email: string,
  data?: Partial<Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      email,
      username: data?.username || null,
      full_name: data?.full_name || null,
      avatar_url: data?.avatar_url || null,
      bio: data?.bio || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);

  return profile;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<UserProfile> {
  // Get current profile for audit logging
  const currentProfile = await getUserProfile(userId);
  if (!currentProfile) throw new Error("Profile not found");

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);

  // Log audit action (if user belongs to a team)
  try {
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (teamMember) {
      await logAuditAction(
        teamMember.team_id,
        userId,
        AuditActions.USER_PROFILE_UPDATED,
        "profile",
        currentProfile.id,
        {
          before: currentProfile,
          after: profile,
        }
      );
    }
  } catch (error) {
    console.warn("Failed to log profile update audit action:", error);
  }

  return profile;
}

// Activate user profile
export async function activateUserProfile(userId: string): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ is_active: true })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to activate profile: ${error.message}`);

  return profile;
}

// Deactivate user profile
export async function deactivateUserProfile(userId: string): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to deactivate profile: ${error.message}`);

  return profile;
}

// Check if username is available
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username);

  if (error) throw new Error(`Failed to check username availability: ${error.message}`);

  return !profiles || profiles.length === 0;
}

// Search user profiles (for team member invitations)
export async function searchUserProfiles(
  searchQuery: string,
  limit: number = 10
): Promise<UserProfile[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
    .limit(limit);

  if (error) throw new Error(`Failed to search profiles: ${error.message}`);

  return profiles || [];
}

// Get user profile by username
export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return profile || null;
}

// Get user profile by email
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return profile || null;
}
