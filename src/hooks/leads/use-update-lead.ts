
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// פונקציה לבדיקה אם ה-ID הוא UUID תקין
const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('🔄 Updating lead:', { id, data });
      
      // בדיקה אם זה ליד מפייסבוק (לא UUID = ליד פייסבוק)
      const isFacebookLead = !isUuid(id);
      
      if (isFacebookLead) {
        console.log('📘 Detected Facebook lead, updating facebook_leads table');
        
        // קריאה של הנתונים הנוכחיים
        const { data: fbLead, error: fetchError } = await supabase
          .from("facebook_leads")
          .select("lead_data")
          .eq("lead_id", id)
          .maybeSingle();
          
        if (fetchError) {
          console.error('❌ Error fetching Facebook lead:', fetchError);
          throw new Error(fetchError.message);
        }
        
        if (!fbLead) {
          console.error('❌ Facebook lead not found for lead_id:', id);
          throw new Error('לא נמצא ליד פייסבוק לעדכון');
        }
        
        // עדכון כל השדות בתוך lead_data (כולל notes, status, וכו')
        const updatedLeadData = {
          ...(fbLead.lead_data as any),
          // מעדכן את כל השדות שהועברו ב-data
          ...(data.status !== undefined && { status: data.status }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.source !== undefined && { source: data.source }),
          ...(data.assigned_to !== undefined && { assigned_to: data.assigned_to }),
          ...(data.car_id !== undefined && { car_id: data.car_id }),
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
