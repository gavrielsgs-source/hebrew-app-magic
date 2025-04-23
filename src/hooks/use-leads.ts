
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

// Define Lead type with explicit source property to avoid TypeScript errors
type Lead = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  status?: string;
  source?: string | null;
  car_id?: string | null;
  assigned_to?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  agency_id?: string | null;
  follow_up_notes?: string[] | null;
  cars?: any;
  profiles?: any;
};

// Define NewLead to match the form values structure with correct optional fields
type NewLead = {
  name: string;
  car_id?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  status?: string;
  source?: string | null;
  assigned_to?: string | null;
};

export function useLeads() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*, cars(*), profiles!assigned_to(*)")
          .order("created_at", { ascending: false });

        if (error) {
          toast.error("שגיאה בטעינת לידים");
          throw error;
        }

        // Return the data with default source values if needed
        return data.map((lead) => ({
          ...lead,
          source: lead.source || "ידני" // Provide a default value if source is null
        })) as Lead[];
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

      // car_id is optional
      const { data, error } = await supabase
        .from("leads")
        .insert({
          ...lead,
          status: lead.status || "new", // Set default status if not provided
          source: lead.source || "ידני", // Set default source if not provided
          user_id: userData.user.id,     // Who created the lead
          assigned_to: lead.assigned_to || userData.user.id // Default to creator if not assigned
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

  const updateLead = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewLead> }) => {
      const { error } = await supabase
        .from("leads")
        .update(data)
        .eq("id", id);

      if (error) {
        toast.error("שגיאה בעדכון ליד");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("ליד עודכן בהצלחה");
    },
  });

  const assignLead = useMutation({
    mutationFn: async ({ leadId, agentId }: { leadId: string; agentId: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ 
          assigned_to: agentId,
          status: "in_progress" // Auto update status when assigned
        })
        .eq("id", leadId);

      if (error) {
        toast.error("שגיאה בשיוך ליד");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("ליד שויך בהצלחה");
    },
  });

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    assignLead
  };
}
