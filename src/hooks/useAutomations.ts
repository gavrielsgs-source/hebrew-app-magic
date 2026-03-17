import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface AutomationSettings {
  id: string;
  user_id: string;
  welcome_enabled: boolean;
  welcome_delay_minutes: number;
  welcome_template: string;
  followup1_enabled: boolean;
  followup1_delay_hours: number;
  followup1_template: string;
  followup2_enabled: boolean;
  followup2_delay_hours: number;
  followup2_template: string;
  car_match_enabled: boolean;
  car_match_template: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationQueueItem {
  id: string;
  user_id: string;
  lead_id: string | null;
  automation_type: string;
  phone: string;
  template_name: string;
  template_params: string[];
  scheduled_for: string;
  status: string;
  attempts: number;
  last_error: string | null;
  sent_at: string | null;
  car_id: string | null;
  created_at: string;
}

export function useAutomationSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["automation_settings", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("automation_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as AutomationSettings | null;
    },
    enabled: !!user?.id,
    staleTime: 0,
  });
}

export function useUpsertAutomationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AutomationSettings>) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("automation_settings")
        .upsert(
          { ...settings, user_id: user.id, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .select("*")
        .single();

      if (error) throw error;
      return data as AutomationSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation_settings"] });
      toast.success("הגדרות האוטומציה נשמרו");
    },
    onError: (err: any) => {
      toast.error("שגיאה בשמירת הגדרות", { description: err.message });
    },
  });
}

export function useAutomationQueue(limit = 100) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["automation_queue", user?.id, limit],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("automation_queue")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as AutomationQueueItem[];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}
