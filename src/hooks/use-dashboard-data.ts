
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { subDays, startOfDay, endOfDay } from "date-fns";

export function useDashboardData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-data", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      console.log('Fetching dashboard data for user:', user.id);

      try {
        const now = new Date();
        const yesterday = subDays(now, 1);
        const today = startOfDay(now);
        const endToday = endOfDay(now);

        // Get untreated leads (over 24 hours old)
        const { data: untreatedLeads, error: leadsError } = await supabase
          .from("leads")
          .select("id, name, created_at, status")
          .eq("user_id", user.id)
          .eq("status", "new")
          .lt("created_at", yesterday.toISOString());

        if (leadsError) {
          console.error("Error fetching untreated leads:", leadsError);
        }

        // Get cars pending publication
        const { data: pendingCars, error: carsError } = await supabase
          .from("cars")
          .select("id, make, model, status")
          .eq("user_id", user.id)
          .eq("status", "pending");

        if (carsError) {
          console.error("Error fetching pending cars:", carsError);
        }

        // Get today's tasks/meetings
        const { data: todayTasks, error: tasksError } = await supabase
          .from("tasks")
          .select("id, title, due_date, type, status")
          .eq("user_id", user.id)
          .gte("due_date", today.toISOString())
          .lte("due_date", endToday.toISOString())
          .neq("status", "completed");

        if (tasksError) {
          console.error("Error fetching today's tasks:", tasksError);
        }

        // Get total leads and cars for quick stats
        const { data: totalLeads, error: totalLeadsError } = await supabase
          .from("leads")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        if (totalLeadsError) {
          console.error("Error fetching total leads count:", totalLeadsError);
        }

        const { data: totalCars, error: totalCarsError } = await supabase
          .from("cars")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        if (totalCarsError) {
          console.error("Error fetching total cars count:", totalCarsError);
        }

        const result = {
          untreatedLeads: untreatedLeads || [],
          pendingCars: pendingCars || [],
          todayTasks: todayTasks || [],
          totalLeadsCount: totalLeads?.length || 0,
          totalCarsCount: totalCars?.length || 0,
        };

        console.log('Dashboard data fetched successfully:', result);
        return result;
      } catch (error) {
        console.error("Critical error in dashboard data fetch:", error);
        throw error;
      }
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
