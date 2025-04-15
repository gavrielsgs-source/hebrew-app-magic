
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("שגיאה בטעינת פרופיל");
        throw error;
      }

      return data as Profile;
    },
    enabled: !!user,
    retry: 1,
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
