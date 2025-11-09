
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface CarsAnalyticsData {
  totalCars: number;
}

export function useCarsAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["cars-analytics"],
    queryFn: async (): Promise<CarsAnalyticsData> => {
      try {
        // ספירת כל הרכבים הפעילים במלאי (לא נמכרו)
        const { data: cars, error: carsError } = await supabase
          .from("cars")
          .select("id")
          .neq("status", "sold");

        if (carsError) throw carsError;
        
        const totalCars = cars?.length || 0;

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
