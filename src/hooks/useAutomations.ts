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

type AutomationSettingsMutationInput = Partial<
  Omit<AutomationSettings, "id" | "user_id" | "created_at" | "updated_at">
> & {
  id?: string;
};

export function useUpsertAutomationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AutomationSettingsMutationInput) => {
      if (!user) throw new Error("Not authenticated");

      const payload = {
        welcome_enabled: settings.welcome_enabled,
        welcome_delay_minutes: settings.welcome_delay_minutes,
        welcome_template: settings.welcome_template,
        followup1_enabled: settings.followup1_enabled,
        followup1_delay_hours: settings.followup1_delay_hours,
        followup1_template: settings.followup1_template,
        followup2_enabled: settings.followup2_enabled,
        followup2_delay_hours: settings.followup2_delay_hours,
        followup2_template: settings.followup2_template,
        car_match_enabled: settings.car_match_enabled,
        car_match_template: settings.car_match_template,
        updated_at: new Date().toISOString(),
      };

      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
      );

      console.log("🔧 [automation] Saving settings for user:", user.id, cleanedPayload);

      const hasExistingRow = typeof settings.id === "string" && settings.id.length > 0;

      const query = hasExistingRow
        ? supabase
            .from("automation_settings")
            .update(cleanedPayload)
            .eq("user_id", user.id)
            .select("*")
            .single()
        : supabase
            .from("automation_settings")
            .insert({ ...cleanedPayload, user_id: user.id })
            .select("*")
            .single();

      const { data, error } = await query;

      if (error) {
        console.error("🔧 [automation] Save error:", error);
        throw error;
      }

      console.log("🔧 [automation] Save success:", data);
      return data as AutomationSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["automation_settings", user?.id], data);
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
