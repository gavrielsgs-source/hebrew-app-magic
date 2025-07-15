
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLead: any) => {
      console.log('🔍 [useCreateLead] Creating lead with data:', newLead);
      
      // Convert empty strings to null for UUID fields to prevent database errors
      const cleanedLead = {
        ...newLead,
        car_id: newLead.car_id === "" ? null : newLead.car_id,
        assigned_to: newLead.assigned_to === "" ? null : newLead.assigned_to,
        agency_id: newLead.agency_id === "" ? null : newLead.agency_id,
        // Also clean other optional fields
        email: newLead.email === "" ? null : newLead.email,
        notes: newLead.notes === "" ? null : newLead.notes,
        source: newLead.source === "" ? "ידני" : newLead.source, // Default source
      };

      console.log('🔍 [useCreateLead] Cleaned lead data:', cleanedLead);

      const { data, error } = await supabase.from("leads").insert([cleanedLead]).select();
      
      if (error) {
        console.error("🔍 [useCreateLead] Database error:", error);
        throw new Error(error.message);
      }
      
      console.log('🔍 [useCreateLead] Lead created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("🔍 [useCreateLead] Mutation error:", error);
    }
  });
};
