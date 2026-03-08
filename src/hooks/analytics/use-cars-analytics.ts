
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CarsAnalyticsData {
  totalCars: number;
  totalInventoryValue: number;
  totalPurchaseCost: number;
}

export function useCarsAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["cars-analytics"],
    queryFn: async (): Promise<CarsAnalyticsData> => {
      try {
        // ספירת כל הרכבים הפעילים במלאי עם ערכים
        const { data: cars, error: carsError } = await supabase
          .from("cars")
          .select("id, price, purchase_cost")
          .neq("status", "sold");

        if (carsError) throw carsError;
        
        const safeCars = cars || [];
        const totalCars = safeCars.length;
        const totalInventoryValue = safeCars.reduce((sum, car) => sum + (car.price || 0), 0);
        const totalPurchaseCost = safeCars.reduce((sum, car) => sum + (car.purchase_cost || 0), 0);

        return {
          totalCars,
          totalInventoryValue,
          totalPurchaseCost,
        };
      } catch (error) {
        console.error("שגיאה בטעינת נתוני רכבים:", error);
        return {
          totalCars: 0,
          totalInventoryValue: 0,
          totalPurchaseCost: 0,
        };
      }
    },
  });
}
