
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type NewLead = Omit<Lead, "id" | "created_at" | "updated_at" | "user_id">;

export function useLeads() {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, cars(*)")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("שגיאה בטעינת לידים");
        throw error;
      }

      return data;
    },
  });

  const addLead = useMutation({
    mutationFn: async (lead: NewLead) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast.error("לא ניתן להוסיף ליד - משתמש לא מחובר");
        throw userError || new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("leads")
        .insert({
          ...lead,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) {
        toast.error("שגיאה בהוספת ליד");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("ליד נוסף בהצלחה");
    },
  });

  return {
    leads,
    isLoading,
    addLead,
  };
}
