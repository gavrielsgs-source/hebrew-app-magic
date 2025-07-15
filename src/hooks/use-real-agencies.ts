
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Agency } from "@/types/user";
import { toast } from "sonner";

export function useRealAgencies() {
  const queryClient = useQueryClient();

  // Fetch all agencies
  const { data: agencies = [], isLoading, error } = useQuery({
    queryKey: ["admin-agencies"],
    queryFn: async (): Promise<Agency[]> => {
      console.log("Fetching agencies...");
      
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching agencies:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Add new agency
  const addAgency = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("agencies")
        .insert({
          name: name,
          owner_id: (await supabase.auth.getUser()).data.user?.id || "",
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding agency:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
      toast.success("הסוכנות נוספה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to add agency:", error);
      toast.error("שגיאה בהוספת הסוכנות");
    },
  });

  // Update agency
  const updateAgency = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("agencies")
        .update({ name: name })
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating agency:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
      toast.success("הסוכנות עודכנה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to update agency:", error);
      toast.error("שגיאה בעדכון הסוכנות");
    },
  });

  return {
    agencies,
    isLoading,
    error,
    addAgency,
    updateAgency,
  };
}
