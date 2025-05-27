
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export interface CarsAnalyticsData {
  totalCars: number;
}

export function useCarsAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["cars-analytics", dateRange],
    queryFn: async (): Promise<CarsAnalyticsData> => {
      try {
        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");
        
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("car_id")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        if (leadsError) throw leadsError;
        
        const safeLeads = leads || [];
        const totalCars = new Set(safeLeads.filter(l => (l as any).car_id).map(l => (l as any).car_id)).size;

        return {
          totalCars,
        };
      } catch (error) {
        console.error("שגיאה בטעינת נתוני רכבים:", error);
        return {
          totalCars: 0,
        };
      }
    },
  });
}
