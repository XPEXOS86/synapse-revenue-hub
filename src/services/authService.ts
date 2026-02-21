import { supabase } from "@/integrations/supabase/client";
import { createUserProfile, getUserProfile } from "./profileService";
import { logAuditAction, AuditActions } from "./auditService";
import type { User } from "@supabase/supabase-js";

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

// Sign up user
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    const { user, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          username: data.username,
        },
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) return { user: null, error };

    if (!user) {
      return {
        user: null,
        error: new Error("Sign up failed: No user returned"),
      };
    }

    // Create user profile
    try {
      await createUserProfile(user.id, data.email, {
        full_name: data.fullName || null,
        username: data.username || null,
      });
    } catch (profileError) {
      console.error("Failed to create user profile:", profileError);
      // Don't fail the entire signup if profile creation fails
    }

    // Log signup action
    try {
      await logAuditAction(
        user.id, // Using user_id as team_id temporarily
        user.id,
        AuditActions.USER_SIGNED_UP,
        "user",
        user.id,
        {
          email: data.email,
          full_name: data.fullName,
          username: data.username,
        }
      );
    } catch (auditError) {
      console.warn("Failed to log signup audit action:", auditError);
    }

    return { user, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err : new Error("Sign up failed"),
    };
  }
}

// Sign in user
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    const { user, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) return { user: null, error };

    if (!user) {
      return {
        user: null,
        error: new Error("Sign in failed: No user returned"),
      };
    }

    // Log signin action
    try {
      await logAuditAction(
        user.id,
        user.id,
        AuditActions.USER_SIGNED_IN,
        "user",
        user.id,
        {
          email: data.email,
        }
      );
    } catch (auditError) {
      console.warn("Failed to log signin audit action:", auditError);
    }

    return { user, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err : new Error("Sign in failed"),
    };
  }
}

// Sign in with OAuth provider
export async function signInWithOAuth(provider: "github" | "google"): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

// Sign out user
export async function signOut(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const userId = data?.session?.user?.id;

  // Log signout action
  if (userId) {
    try {
      await logAuditAction(userId, userId, AuditActions.USER_SIGNED_OUT, "user", userId);
    } catch (auditError) {
      console.warn("Failed to log signout audit action:", auditError);
    }
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

// Update password
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
}

// Get current session
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// Verify email with OTP
export async function verifyEmailWithOTP(email: string, token: string): Promise<AuthResponse> {
  try {
    const { user, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) return { user: null, error };

    return { user: user || null, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err : new Error("Email verification failed"),
    };
  }
}

// Send magic link
export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

// Update user metadata
export async function updateUserMetadata(metadata: Record<string, unknown>): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (error) throw error;

  return user || null;
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Failed to check email existence");
  }
}

// Get user with profile
export async function getUserWithProfile(userId: string) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError) throw userError;

    const profile = await getUserProfile(userId);

    return {
      user,
      profile,
    };
  } catch (err) {
    throw err instanceof Error ? err : new Error("Failed to fetch user with profile");
  }
}
