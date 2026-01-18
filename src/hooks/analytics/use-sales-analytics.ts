
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface SalesAnalyticsData {
  salesByAgent: { agent: string; sales: number; amount: number }[];
  salesOverTime: { month: string; sales: number; amount: number }[];
}

export function useSalesAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["sales-analytics", dateRange],
    queryFn: async (): Promise<SalesAnalyticsData> => {
      try {
        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");
        
        // שליפת רכבים שנמכרו - זה מבוסס על סטטוס הרכב ולא הליד
        const { data: soldCars, error: carsError } = await supabase
          .from("cars")
          .select("*")
          .eq("status", "sold")
          .gte("updated_at", fromDate)
          .lte("updated_at", toDate);

        if (carsError) throw carsError;
        
        // Only fetch current user's profile for security
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) throw new Error("משתמש לא מחובר");
        
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const safeCars = soldCars || [];
        
        // חישוב מכירות של המשתמש הנוכחי בלבד (אבטחה)
        const userCars = safeCars.filter(car => car.user_id === currentUser.user.id);
        const userSales = userCars.length;
        const userAmount = userCars.reduce((sum, car) => {
          const carPrice = car.price;
          return sum + (typeof carPrice === 'number' ? carPrice : 0);
        }, 0);
        
        const salesByAgent = [{
          agent: userProfile?.full_name || "אני",
          sales: userSales,
          amount: userAmount,
        }].filter(agent => agent.sales > 0);
        
        // חישוב מכירות לאורך זמן - קיבוץ חודשי לפי תאריך עדכון הרכב
        const salesByMonth: Record<string, { sales: number; amount: number }> = {};
        
        userCars.forEach((car) => {
          const updatedAt = car.updated_at;
          if (typeof updatedAt === 'string') {
            const date = new Date(updatedAt);
            const monthKey = format(date, 'yyyy-MM');
            if (!salesByMonth[monthKey]) {
              salesByMonth[monthKey] = { sales: 0, amount: 0 };
            }
            salesByMonth[monthKey].sales += 1;
            const carPrice = car.price;
            salesByMonth[monthKey].amount += (typeof carPrice === 'number' ? carPrice : 0);
          }
        });

        const salesOverTime = Object.entries(salesByMonth)
          .map(([monthKey, data]) => ({
            month: monthKey,
            sales: data.sales,
            amount: data.amount,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

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
