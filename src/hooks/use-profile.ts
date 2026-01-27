
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
  accountant_email: string | null;
  // Company details for documents
  company_address: string | null;
  company_hp: string | null;
  company_authorized_dealer: boolean | null;
}

interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  company_name?: string;
  position?: string;
  avatar_url?: string;
  accountant_email?: string;
  // Company details for documents
  company_address?: string;
  company_hp?: string;
  company_authorized_dealer?: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        console.log("Fetching profile for user:", user.id);
        
        // Get the existing profile
        const { data, error } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id)
          .single();

        if (error) {
          // אם יש שגיאה עם שליפת המידע (למשל, פרופיל לא קיים)
          if (error.code === "PGRST116") {
            console.log("Profile not found, creating a new one");
            
            // נסה ליצור פרופיל חדש
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

            return {
              id: newProfile.id as string,
              full_name: newProfile.full_name as string | null,
              phone: newProfile.phone as string | null,
              company_name: newProfile.company_name as string | null,
              position: newProfile.position as string | null,
              avatar_url: newProfile.avatar_url as string | null,
              accountant_email: newProfile.accountant_email as string | null,
              company_address: (newProfile as any).company_address as string | null,
              company_hp: (newProfile as any).company_hp as string | null,
              company_authorized_dealer: (newProfile as any).company_authorized_dealer as boolean | null,
            } as Profile;
          } else {
            console.error("Error fetching profile:", error);
            toast.error("שגיאה בטעינת פרופיל");
            throw error;
          }
        }

        return {
          id: data.id as string,
          full_name: data.full_name as string | null,
          phone: data.phone as string | null,
          company_name: data.company_name as string | null,
          position: data.position as string | null,
          avatar_url: data.avatar_url as string | null,
          accountant_email: data.accountant_email as string | null,
          company_address: (data as any).company_address as string | null,
          company_hp: (data as any).company_hp as string | null,
          company_authorized_dealer: (data as any).company_authorized_dealer as boolean | null,
        } as Profile;
      } catch (error) {
        console.error("Error in profile function:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    staleTime: 300000, // 5 דקות
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user) throw new Error("לא מחובר");

      const { error } = await supabase
        .from("profiles")
        .update(updates as Record<string, unknown>)
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("שגיאה בעדכון פרופיל");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
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
