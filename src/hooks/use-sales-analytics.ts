
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
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*, cars(*)");

      if (leadsError) {
        toast.error("שגיאה בטעינת נתוני מכירות");
        throw leadsError;
      }

      // Group data by month
      const monthlyStats = leads.reduce((acc: Record<string, SalesAnalytics>, lead) => {
        const month = new Date(lead.created_at).toISOString().slice(0, 7); // YYYY-MM
        
        if (!acc[month]) {
          acc[month] = {
            month,
            totalLeads: 0,
            convertedLeads: 0,
            totalCars: 0,
            carsSold: 0,
            revenue: 0
          };
        }
        
        acc[month].totalLeads++;
        if (lead.status === 'closed') {
          acc[month].convertedLeads++;
        }
        
        if (lead.cars) {
          acc[month].totalCars++;
          if (lead.cars.status === 'sold') {
            acc[month].carsSold++;
            acc[month].revenue += lead.cars.price || 0;
          }
        }
        
        return acc;
      }, {});

      return Object.values(monthlyStats).sort((a, b) => 
        new Date(b.month).getTime() - new Date(a.month).getTime()
      );
    }
  });
}
