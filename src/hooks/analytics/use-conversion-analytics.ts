
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
        
        // שליפת לידים בטווח
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("id, source, car_id")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        if (leadsError) throw leadsError;

        // שליפת מכירות בפועל מ-customer_vehicle_sales
        const { data: sales, error: salesError } = await supabase
          .from("customer_vehicle_sales")
          .select("car_id")
          .gte("sale_date", fromDate)
          .lte("sale_date", toDate);

        if (salesError) throw salesError;
        
        const safeLeads = leads || [];
        const safeSales = sales || [];
        const totalLeads = safeLeads.length;
        const totalSales = safeSales.length;
        
        // יצירת סט של car_ids שנמכרו
        const soldCarIds = new Set(safeSales.map(s => s.car_id));
        
        // חישוב שיעור המרה - מכירות בפועל / סה"כ לידים
        const conversionRate = totalLeads > 0 ? (totalSales / totalLeads) * 100 : 0;
        
        // חישוב מקורות לידים
        const sources = safeLeads.reduce((acc: Record<string, { total: number; converted: number }>, lead) => {
          const source = lead.source || "לא ידוע";
          if (!acc[source]) {
            acc[source] = { total: 0, converted: 0 };
          }
          acc[source].total++;
          // ליד הומר אם הרכב שלו נמכר
          if (lead.car_id && soldCarIds.has(lead.car_id)) {
            acc[source].converted++;
          }
          return acc;
        }, {});
        
        // חישוב המרות לפי מקור
        const conversionBySource = Object.entries(sources).map(([source, data]) => ({
          source,
          rate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
        }));

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
