
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
    queryKey: ["sales-analytics"],
    queryFn: async () => {
      try {
        // נסה לקבל נתונים מהמבט sales_analytics שיצרנו
        const { data: monthlyStats, error: viewError } = await supabase
          .from("monthly_stats")
          .select("*");

        if (!viewError && monthlyStats && monthlyStats.length > 0) {
          // אם יש נתונים במבט, השתמש בהם
          return monthlyStats.map(stat => ({
            month: stat.month,
            totalLeads: stat.total_leads || 0,
            convertedLeads: stat.converted_leads || 0,
            totalCars: stat.total_cars || 0,
            carsSold: stat.cars_sold || 0,
            revenue: stat.revenue || 0
          }));
        }

        // במקרה של כישלון או אין נתונים, נסה לבנות את הנתונים באופן ידני
        console.log("No data in monthly_stats view or error, falling back to manual calculation");
        
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("*, cars(*)");

        if (leadsError) {
          toast.error("שגיאה בטעינת נתוני מכירות");
          throw leadsError;
        }

        // קבץ נתונים לפי חודש
        const monthlyData: Record<string, SalesAnalytics> = {};
        
        leads.forEach(lead => {
          const month = new Date(lead.created_at).toISOString().slice(0, 7); // YYYY-MM
          
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month,
              totalLeads: 0,
              convertedLeads: 0,
              totalCars: 0,
              carsSold: 0,
              revenue: 0
            };
          }
          
          monthlyData[month].totalLeads++;
          if (lead.status === 'closed') {
            monthlyData[month].convertedLeads++;
          }
          
          if (lead.cars) {
            monthlyData[month].totalCars++;
            if (lead.cars.status === 'sold') {
              monthlyData[month].carsSold++;
              monthlyData[month].revenue += lead.cars.price || 0;
            }
          }
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
    refetchInterval: 60000, // רענן כל דקה
  });
}
