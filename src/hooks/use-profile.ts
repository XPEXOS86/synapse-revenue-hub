import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UpdateProfileInput {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export function useProfile() {
  const { profile, loadProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!profile) {
        setError(new Error("Profile not loaded"));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from("profiles")
          .update({
            username: input.username ?? profile.username,
            full_name: input.full_name ?? profile.full_name,
            avatar_url: input.avatar_url ?? profile.avatar_url,
            bio: input.bio ?? profile.bio,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Reload profile
        await loadProfile();

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update profile");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [profile, loadProfile]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!profile) {
        setError(new Error("Profile not loaded"));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

        // Update profile with avatar URL
        const updatedProfile = await updateProfile({ avatar_url: data.publicUrl });
        return updatedProfile;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to upload avatar");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [profile, updateProfile]
  );

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
  };
}
