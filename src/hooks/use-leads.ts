
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"] & {
  source?: string | null;  // Explicitly add source property
};

// Define NewLead to match the form values structure with correct optional fields
type NewLead = {
  name: string;
  car_id?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  status?: string;
  source?: string | null;  // Include source here as well
};

export function useLeads() {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*, cars(*)")
          .order("created_at", { ascending: false });

        if (error) {
          toast.error("שגיאה בטעינת לידים");
          throw error;
        }

        // Add a default source value for any leads that don't have one
        return data.map((lead) => ({
          ...lead,
          source: lead.source || "ידני" // Provide a default value if source is null
        }));
      } catch (error) {
        toast.error("שגיאה בטעינת לידים");
        throw error;
      }
    },
  });

  const addLead = useMutation({
    mutationFn: async (lead: NewLead) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast.error("לא ניתן להוסיף ליד - משתמש לא מחובר");
        throw userError || new Error("User not authenticated");
      }

      // car_id is now optional
      const { data, error } = await supabase
        .from("leads")
        .insert({
          ...lead,
          status: lead.status || "new", // Set default status if not provided
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
