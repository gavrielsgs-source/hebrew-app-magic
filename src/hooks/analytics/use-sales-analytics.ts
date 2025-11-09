
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface SalesAnalyticsData {
  salesByAgent: { agent: string; sales: number; amount: number }[];
  salesOverTime: { month: string; sales: number; amount: number }[];
}

export function useSalesAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["sales-analytics", dateRange],
    queryFn: async (): Promise<SalesAnalyticsData> => {
      try {
        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");
        
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("*, cars(*)")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        if (leadsError) throw leadsError;
        
        // Only fetch current user's profile for security
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) throw new Error("משתמש לא מחובר");
        
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const safeLeads = leads || [];
        
        // חישוב מכירות של המשתמש הנוכחי בלבד (אבטחה)
        const userLeads = safeLeads.filter(l => (l as any).user_id === currentUser.user.id);
        const userSales = userLeads.filter(l => (l as any).status === "closed").length;
        const userAmount = userLeads
          .filter(l => (l as any).status === "closed" && (l as any).cars && (l as any).cars.price)
          .reduce((sum: number, l: any) => {
            const carPrice = l.cars?.price;
            return sum + (typeof carPrice === 'number' ? carPrice : 0);
          }, 0);
        
        const salesByAgent = [{
          agent: userProfile?.full_name || "אני",
          sales: userSales,
          amount: userAmount,
        }].filter(agent => agent.sales > 0);
        
        // חישוב מכירות לאורך זמן - קיבוץ חודשי
        const salesByMonth: Record<string, { sales: number; amount: number }> = {};
        
        userLeads.filter(l => (l as any).status === "closed").forEach((lead: any) => {
          const createdAt = lead.created_at;
          if (typeof createdAt === 'string') {
            const date = new Date(createdAt);
            const monthKey = format(date, 'yyyy-MM');
            if (!salesByMonth[monthKey]) {
              salesByMonth[monthKey] = { sales: 0, amount: 0 };
            }
            salesByMonth[monthKey].sales += 1;
            const carPrice = lead.cars?.price;
            salesByMonth[monthKey].amount += (typeof carPrice === 'number' ? carPrice : 0);
          }
        });

        const salesOverTime = Object.entries(salesByMonth)
          .map(([monthKey, data]) => ({
            month: monthKey,
            sales: data.sales,
            amount: data.amount,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        return {
          salesByAgent,
          salesOverTime,
        };
      } catch (error) {
        console.error("שגיאה בטעינת נתוני מכירות:", error);
        return {
          salesByAgent: [],
          salesOverTime: [],
        };
      }
    },
  });
}
