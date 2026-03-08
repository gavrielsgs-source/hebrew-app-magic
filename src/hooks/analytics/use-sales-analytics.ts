
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface SalesAnalyticsData {
  salesByAgent: { agent: string; sales: number; amount: number }[];
  salesOverTime: { month: string; sales: number; amount: number }[];
  totalRevenue: number;
  totalPurchaseCost: number;
  totalExpenses: number;
  grossProfit: number;
}

export function useSalesAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["sales-analytics", dateRange],
    queryFn: async (): Promise<SalesAnalyticsData> => {
      try {
        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");
        
        // שליפת מכירות בפועל מטבלת customer_vehicle_sales
        const { data: sales, error: salesError } = await supabase
          .from("customer_vehicle_sales")
          .select("*, cars(make, model, price, purchase_cost, user_id)")
          .gte("sale_date", fromDate)
          .lte("sale_date", toDate);

        if (salesError) throw salesError;

        // שליפת הוצאות רכבים בטווח התאריכים
        const { data: expenses, error: expensesError } = await supabase
          .from("car_expenses")
          .select("amount, car_id")
          .gte("expense_date", fromDate)
          .lte("expense_date", toDate);

        if (expensesError) throw expensesError;

        // פרופיל המשתמש הנוכחי
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) throw new Error("משתמש לא מחובר");

        const { data: userProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUser.user.id)
          .single();

        const safeSales = sales || [];
        const safeExpenses = expenses || [];

        // חישוב הכנסות ממכירות בפועל
        let totalRevenue = 0;
        let totalPurchaseCost = 0;

        const salesByMonth: Record<string, { sales: number; amount: number }> = {};

        safeSales.forEach((sale) => {
          const salePrice = sale.sale_price || 0;
          totalRevenue += salePrice;

          const car = sale.cars as any;
          if (car?.purchase_cost) {
            totalPurchaseCost += car.purchase_cost;
          }

          const saleDate = sale.sale_date;
          if (saleDate) {
            const monthKey = saleDate.slice(0, 7); // YYYY-MM
            if (!salesByMonth[monthKey]) {
              salesByMonth[monthKey] = { sales: 0, amount: 0 };
            }
            salesByMonth[monthKey].sales += 1;
            salesByMonth[monthKey].amount += salePrice;
          }
        });

        // סיכום הוצאות
        const totalExpenses = safeExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const grossProfit = totalRevenue - totalPurchaseCost - totalExpenses;

        const salesOverTime = Object.entries(salesByMonth)
          .map(([month, data]) => ({ month, sales: data.sales, amount: data.amount }))
          .sort((a, b) => a.month.localeCompare(b.month));

        const salesByAgent = safeSales.length > 0
          ? [{
              agent: userProfile?.full_name || "אני",
              sales: safeSales.length,
              amount: totalRevenue,
            }]
          : [];

        return {
          salesByAgent,
          salesOverTime,
          totalRevenue,
          totalPurchaseCost,
          totalExpenses,
          grossProfit,
        };
      } catch (error) {
        console.error("שגיאה בטעינת נתוני מכירות:", error);
        return {
          salesByAgent: [],
          salesOverTime: [],
          totalRevenue: 0,
          totalPurchaseCost: 0,
          totalExpenses: 0,
          grossProfit: 0,
        };
      }
    },
  });
}
