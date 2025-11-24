import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminSubscription {
  subscription_id: string;
  user_id: string;
  user_email: string;
  full_name: string | null;
  phone: string | null;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  expires_at: string | null;
  billing_amount: number | null;
  billing_cycle: string | null;
  next_billing_date: string | null;
  cancel_at_period_end: boolean | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  company_id: string | null;
  max_users: number | null;
  active_users_count: number | null;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  cancelled_subscriptions: number;
  mrr: number;
  arr: number;
}

export interface SubscriptionTimeline {
  month: string;
  active: number;
  trial: number;
  expired: number;
  cancelled: number;
}

export function useAdminSubscriptions() {
  const queryClient = useQueryClient();

  // קבלת כל המנויים
  const { data: subscriptions = [], isLoading, error } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async (): Promise<AdminSubscription[]> => {
      const { data, error } = await supabase.rpc("get_all_subscriptions");
      if (error) throw error;
      return data || [];
    },
  });

  // קבלת סטטיסטיקות
  const { data: stats } = useQuery({
    queryKey: ["admin-subscription-stats"],
    queryFn: async (): Promise<SubscriptionStats> => {
      const { data, error } = await supabase.rpc("get_subscription_stats");
      if (error) throw error;
      if (!data) {
        return {
          total_subscriptions: 0,
          active_subscriptions: 0,
          trial_subscriptions: 0,
          expired_subscriptions: 0,
          cancelled_subscriptions: 0,
          mrr: 0,
          arr: 0,
        };
      }
      return data as unknown as SubscriptionStats;
    },
  });

  // קבלת נתוני ציר זמן
  const { data: timeline = [] } = useQuery({
    queryKey: ["admin-subscription-timeline"],
    queryFn: async (): Promise<SubscriptionTimeline[]> => {
      const { data, error } = await supabase.rpc("get_subscription_timeline");
      if (error) throw error;
      return data || [];
    },
  });

  // הארכת מנוי
  const extendSubscription = useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      days, 
      reason 
    }: { 
      subscriptionId: string; 
      days: number; 
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc("admin_extend_subscription", {
        p_subscription_id: subscriptionId,
        p_days: days,
        p_reason: reason || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-stats"] });
      toast.success("המנוי הוארך בהצלחה");
    },
    onError: (error) => {
      console.error("Error extending subscription:", error);
      toast.error("שגיאה בהארכת המנוי");
    },
  });

  // שינוי סטטוס
  const changeStatus = useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      newStatus, 
      reason 
    }: { 
      subscriptionId: string; 
      newStatus: string; 
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc("admin_change_subscription_status", {
        p_subscription_id: subscriptionId,
        p_new_status: newStatus,
        p_reason: reason || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-timeline"] });
      toast.success("הסטטוס עודכן בהצלחה");
    },
    onError: (error) => {
      console.error("Error changing status:", error);
      toast.error("שגיאה בעדכון הסטטוס");
    },
  });

  // שינוי חבילה
  const changeTier = useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      newTier, 
      reason 
    }: { 
      subscriptionId: string; 
      newTier: string; 
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc("admin_change_subscription_tier", {
        p_subscription_id: subscriptionId,
        p_new_tier: newTier,
        p_reason: reason || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-stats"] });
      toast.success("החבילה שונתה בהצלחה");
    },
    onError: (error) => {
      console.error("Error changing tier:", error);
      toast.error("שגיאה בשינוי החבילה");
    },
  });

  return {
    subscriptions,
    stats,
    timeline,
    isLoading,
    error,
    extendSubscription,
    changeStatus,
    changeTier,
  };
}
