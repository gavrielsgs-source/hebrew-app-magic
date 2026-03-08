
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalesAnalytics {
  month: string;
  totalLeads: number;
  convertedLeads: number;
  totalCars: number;
  carsSold: number;
  revenue: number;
}

export function useSalesAnalytics() {
  return useQuery({
    queryKey: ["sales-analytics-dashboard"],
    queryFn: async () => {
      try {
        // שליפת מכירות בפועל מטבלת customer_vehicle_sales
        const { data: sales, error: salesError } = await supabase
          .from("customer_vehicle_sales")
          .select("sale_date, sale_price, car_id");

        if (salesError) {
          toast.error("שגיאה בטעינת נתוני מכירות");
          throw salesError;
        }

        // שליפת לידים
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("id, created_at, status, car_id");

        if (leadsError) {
          toast.error("שגיאה בטעינת נתוני לידים");
          throw leadsError;
        }

        // שליפת מספר רכבים במלאי
        const { data: cars, error: carsError } = await supabase
          .from("cars")
          .select("id, created_at")
          .neq("status", "sold");

        if (carsError) throw carsError;

        // יצירת סט מכירות לפי car_id
        const soldCarIds = new Set((sales || []).map(s => s.car_id));

        // קבץ נתונים לפי חודש
        const monthlyData: Record<string, SalesAnalytics> = {};

        // לידים לפי חודש
        (leads || []).forEach(lead => {
          const month = new Date(lead.created_at!).toISOString().slice(0, 7);
          if (!monthlyData[month]) {
            monthlyData[month] = { month, totalLeads: 0, convertedLeads: 0, totalCars: 0, carsSold: 0, revenue: 0 };
          }
          monthlyData[month].totalLeads++;
          if (lead.car_id && soldCarIds.has(lead.car_id)) {
            monthlyData[month].convertedLeads++;
          }
        });

        // מכירות בפועל לפי חודש
        (sales || []).forEach(sale => {
          const month = sale.sale_date ? sale.sale_date.slice(0, 7) : new Date().toISOString().slice(0, 7);
          if (!monthlyData[month]) {
            monthlyData[month] = { month, totalLeads: 0, convertedLeads: 0, totalCars: 0, carsSold: 0, revenue: 0 };
          }
          monthlyData[month].carsSold++;
          monthlyData[month].revenue += sale.sale_price || 0;
        });

        // רכבים במלאי לפי חודש כניסה
        (cars || []).forEach(car => {
          const month = new Date(car.created_at!).toISOString().slice(0, 7);
          if (!monthlyData[month]) {
            monthlyData[month] = { month, totalLeads: 0, convertedLeads: 0, totalCars: 0, carsSold: 0, revenue: 0 };
          }
          monthlyData[month].totalCars++;
        });

        return Object.values(monthlyData).sort((a, b) => 
          new Date(a.month).getTime() - new Date(b.month).getTime()
        );
      } catch (error) {
        console.error("Error fetching sales analytics:", error);
        toast.error("שגיאה בטעינת נתוני מכירות");
        return [];
      }
    },
    refetchInterval: 60000,
  });
}
