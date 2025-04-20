
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "./use-auth";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  position: string | null;
  avatar_url: string | null;
}

interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  company_name?: string;
  position?: string;
  avatar_url?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!user) return null;

      try {
        // First, try to get the existing profile
        let { data, error } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id)
          .maybeSingle(); // Use maybeSingle instead of single

        // If no profile exists, create one
        if (!data && !error) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({ id: user.id })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast.error("שגיאה ביצירת פרופיל");
            throw insertError;
          }

          return newProfile as Profile;
        }

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("שגיאה בטעינת פרופיל");
          throw error;
        }

        return data as Profile;
      } catch (error) {
        console.error("Error in profile function:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user) throw new Error("לא מחובר");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("שגיאה בעדכון פרופיל");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("הפרופיל עודכן בהצלחה");
    },
  });

  return {
    profile,
    isLoading,
    isError,
    error,
    updateProfile,
  };
}
