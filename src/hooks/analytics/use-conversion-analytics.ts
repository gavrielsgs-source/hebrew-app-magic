
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface ConversionAnalyticsData {
  conversionRate: number;
  conversionBySource: { source: string; rate: number }[];
  totalSales: number;
}

export function useConversionAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["conversion-analytics", dateRange],
    queryFn: async (): Promise<ConversionAnalyticsData> => {
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
        const totalSales = safeLeads.filter(lead => (lead as any).status === "closed").length;
        
        // חישוב שיעור המרה
        const conversionRate = totalLeads > 0 ? (totalSales / totalLeads) * 100 : 0;
        
        // חישוב מקורות לידים
        const sources = safeLeads.reduce((acc: Record<string, number>, lead) => {
          const source = (lead as any).source || "לא ידוע";
          if (typeof source === 'string') {
            acc[source] = (acc[source] || 0) + 1;
          }
          return acc;
        }, {});
        
        // חישוב המרות לפי מקור
        const conversionBySource = Object.entries(sources).map(([source, count]) => {
          const sourceLeads = safeLeads.filter(l => (l as any).source === source);
          const sourceSales = sourceLeads.filter(l => (l as any).status === "closed").length;
          return {
            source,
            rate: sourceLeads.length > 0 ? (sourceSales / sourceLeads.length) * 100 : 0,
          };
        });

        return {
          conversionRate,
          conversionBySource,
          totalSales,
        };
      } catch (error) {
        console.error("שגיאה בטעינת נתוני המרות:", error);
        return {
          conversionRate: 0,
          conversionBySource: [],
          totalSales: 0,
        };
      }
    },
  });
}
