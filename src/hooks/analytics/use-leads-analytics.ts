
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface LeadsAnalyticsData {
  totalLeads: number;
  leadsBySource: { source: string; count: number }[];
  leadsOverTime: { date: string; count: number }[];
  avgResponseTime: number;
}

export function useLeadsAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["leads-analytics", dateRange],
    queryFn: async (): Promise<LeadsAnalyticsData> => {
      try {
        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");
        
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        if (leadsError) throw leadsError;
        
        const safeLeads = leads || [];
        const totalLeads = safeLeads.length;
        
        // חישוב מקורות לידים
        const sources = safeLeads.reduce((acc: Record<string, number>, lead) => {
          const source = (lead as any).source || "לא ידוע";
          if (typeof source === 'string') {
            acc[source] = (acc[source] || 0) + 1;
          }
          return acc;
        }, {});

        const leadsBySource = Object.entries(sources).map(([source, count]) => ({
          source,
          count: count as number,
        }));
        
        // חישוב לידים לאורך זמן
        const leadsByDate = safeLeads.reduce((acc: Record<string, number>, lead) => {
          const createdAt = (lead as any).created_at;
          if (typeof createdAt === 'string') {
            const date = createdAt.split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {});

        const leadsOverTime = Object.entries(leadsByDate)
          .map(([date, count]) => ({
            date,
            count: count as number,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // חישוב זמן תגובה ממוצע (אם אין שדה responded_at, מחזיר 0)
        const responseTimes = safeLeads
          .filter(l => (l as any).status !== 'new')
          .map(l => {
            const created = new Date((l as any).created_at);
            const updated = new Date((l as any).updated_at);
            return (updated.getTime() - created.getTime()) / 1000 / 60; // דקות
          });
        const avgResponseTime = responseTimes.length > 0 
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
          : 0;

        return {
          totalLeads,
          leadsBySource,
          leadsOverTime,
          avgResponseTime,
        };
      } catch (error) {
        console.error("שגיאה בטעינת נתוני לידים:", error);
        return {
          totalLeads: 0,
          leadsBySource: [],
          leadsOverTime: [],
          avgResponseTime: 0,
        };
      }
    },
  });
}
