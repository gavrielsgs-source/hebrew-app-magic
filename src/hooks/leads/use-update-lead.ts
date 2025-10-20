
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('🔄 Updating lead:', { id, data });
      
      // Convert empty strings to null for UUID fields to prevent database errors
      const cleanedData = {
        ...data,
        car_id: data.car_id === "" ? null : data.car_id,
        assigned_to: data.assigned_to === "" ? null : data.assigned_to,
        agency_id: data.agency_id === "" ? null : data.agency_id,
        // Also clean other optional fields
        email: data.email === "" ? null : data.email,
        notes: data.notes === "" ? null : data.notes,
        source: data.source === "" ? null : data.source,
      };

      const { data: responseData, error } = await supabase
        .from("leads")
        .update(cleanedData)
        .eq("id", id)
        .select();

      if (error) {
        console.error('❌ Error updating lead:', error);
        throw new Error(error.message);
      }
      
      console.log('✅ Lead updated successfully:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log('✅ Invalidating leads cache after update');
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};
