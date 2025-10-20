
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('🔄 Updating lead:', { id, data });
      
      // בדיקה אם זה ליד מפייסבוק (IDs של פייסבוק מכילים מקפים)
      const isFacebookLead = id.includes('-');
      
      if (isFacebookLead) {
        console.log('📘 Detected Facebook lead, updating facebook_leads table');
        
        // קריאה של הנתונים הנוכחיים
        const { data: fbLead, error: fetchError } = await supabase
          .from("facebook_leads")
          .select("lead_data")
          .eq("lead_id", id)
          .single();
          
        if (fetchError) {
          console.error('❌ Error fetching Facebook lead:', fetchError);
          throw new Error(fetchError.message);
        }
        
        // עדכון הסטטוס בתוך lead_data
        const updatedLeadData = {
          ...(fbLead.lead_data as any),
          status: data.status || (fbLead.lead_data as any).status
        };
        
        const { data: responseData, error } = await supabase
          .from("facebook_leads")
          .update({ lead_data: updatedLeadData })
          .eq("lead_id", id)
          .select();
          
        if (error) {
          console.error('❌ Error updating Facebook lead:', error);
          throw new Error(error.message);
        }
        
        console.log('✅ Facebook lead updated successfully:', responseData);
        return responseData;
      }
      
      // לידים רגילים - הלוגיקה הקיימת
      const cleanedData = {
        ...data,
        car_id: data.car_id === "" ? null : data.car_id,
        assigned_to: data.assigned_to === "" ? null : data.assigned_to,
        agency_id: data.agency_id === "" ? null : data.agency_id,
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
