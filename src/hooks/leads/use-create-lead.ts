
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLead: any) => {
      // Convert empty strings to null for UUID fields to prevent database errors
      const cleanedLead = {
        ...newLead,
        car_id: newLead.car_id === "" ? null : newLead.car_id,
        assigned_to: newLead.assigned_to === "" ? null : newLead.assigned_to,
        agency_id: newLead.agency_id === "" ? null : newLead.agency_id,
        // Also clean other optional fields
        email: newLead.email === "" ? null : newLead.email,
        notes: newLead.notes === "" ? null : newLead.notes,
        source: newLead.source === "" ? null : newLead.source,
      };

      const { data, error } = await supabase.from("leads").insert([cleanedLead]).select();
      
      if (error) {
        console.error("שגיאה ביצירת ליד:", error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("שגיאה בהוספת לקוח:", error);
    }
  });
};
