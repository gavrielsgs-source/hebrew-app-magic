
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, reminderDate, note }: { leadId: string; reminderDate: string; note: string }) => {
      const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("notes, follow_up_notes")
        .eq("id", leadId)
        .single();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      const reminder = {
        date: reminderDate,
        note: note,
        created_at: new Date().toISOString(),
        completed: false
      };
      
      let followUpNotes = lead.follow_up_notes || [];
      followUpNotes = [...followUpNotes, reminder];
      
      const { data, error } = await supabase
        .from("leads")
        .update({ follow_up_notes: followUpNotes })
        .eq("id", leadId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      leadId, 
      reminderIndex, 
      completed 
    }: { 
      leadId: string; 
      reminderIndex: number; 
      completed: boolean 
    }) => {
      const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("follow_up_notes")
        .eq("id", leadId)
        .single();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      if (!lead.follow_up_notes || !Array.isArray(lead.follow_up_notes)) {
        throw new Error("אין תזכורות ללקוח זה");
      }
      
      const updatedFollowUpNotes = [...lead.follow_up_notes];
      if (reminderIndex >= 0 && reminderIndex < updatedFollowUpNotes.length) {
        updatedFollowUpNotes[reminderIndex] = {
          ...updatedFollowUpNotes[reminderIndex],
          completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        };
      }
      
      const { data, error } = await supabase
        .from("leads")
        .update({ follow_up_notes: updatedFollowUpNotes })
        .eq("id", leadId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};
