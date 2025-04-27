import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchLeads = async () => {
  // שינינו את השאילתה כך שלא תנסה לקשר בין טבלאות שאין ביניהן קשר מוגדר
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      cars (
        make,
        model,
        year
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("שגיאה בטעינת לקוחות:", error);
    throw new Error(error.message);
  }
  return data || [];
};

export const useLeads = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });

  return { 
    leads: data || [], 
    isLoading, 
    error 
  };
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newLead: any) => {
      const { data, error } = await supabase.from("leads").insert([newLead]).select();
      
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

  return mutation;
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: responseData, error } = await supabase
        .from("leads")
        .update(data)
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return mutation;
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("leads").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return mutation;
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ leadId, reminderDate, note }: { leadId: string; reminderDate: string; note: string }) => {
      // בדוק אם יש כבר הערות
      const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("notes, follow_up_notes")
        .eq("id", leadId)
        .single();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // הכן את התזכורת
      const reminder = {
        date: reminderDate,
        note: note,
        created_at: new Date().toISOString(),
        completed: false
      };
      
      // עדכן את הלקוח עם התזכורת החדשה
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

  return mutation;
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ 
      leadId, 
      reminderIndex, 
      completed 
    }: { 
      leadId: string; 
      reminderIndex: number; 
      completed: boolean 
    }) => {
      // בדוק אם יש כבר תזכורות
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
      
      // עדכן את התזכורת
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

  return mutation;
};
