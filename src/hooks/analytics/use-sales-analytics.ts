
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export interface SalesAnalyticsData {
  salesByAgent: { agent: string; sales: number; amount: number }[];
  salesOverTime: { date: string; sales: number; amount: number }[];
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
        
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
          
        if (profilesError) throw profilesError;
        
        const safeLeads = leads || [];
        const safeProfiles = profiles || [];
        
        // חישוב מכירות לפי סוכן
        const salesByAgent = safeProfiles
          .map((profile: any) => {
            const agentLeads = safeLeads.filter(l => (l as any).assigned_to === profile.id);
            const sales = agentLeads.filter(l => (l as any).status === "closed").length;
            const amount = agentLeads
              .filter(l => (l as any).status === "closed" && (l as any).cars && (l as any).cars.price)
              .reduce((sum: number, l: any) => {
                const carPrice = l.cars?.price;
                return sum + (typeof carPrice === 'number' ? carPrice : 0);
              }, 0);
            
            return {
              agent: profile.full_name || profile.id,
              sales,
              amount,
            };
          })
          .filter((agent: any) => agent.sales > 0);
        
        // חישוב מכירות לאורך זמן
        const salesByDate: Record<string, { sales: number; amount: number }> = {};
        
        safeLeads.filter(l => (l as any).status === "closed").forEach((lead: any) => {
          const createdAt = lead.created_at;
          if (typeof createdAt === 'string') {
            const date = createdAt.split("T")[0];
            if (!salesByDate[date]) {
              salesByDate[date] = { sales: 0, amount: 0 };
            }
            salesByDate[date].sales += 1;
            const carPrice = lead.cars?.price;
            salesByDate[date].amount += (typeof carPrice === 'number' ? carPrice : 0);
          }
        });

        const salesOverTime = Object.entries(salesByDate)
          .map(([date, data]) => ({
            date,
            sales: data.sales,
            amount: data.amount,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

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
