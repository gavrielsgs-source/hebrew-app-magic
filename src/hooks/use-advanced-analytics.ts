
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format, subMonths } from "date-fns";

export interface AdvancedAnalyticsData {
  // נתונים כלליים
  totalLeads: number;
  totalCars: number;
  totalSales: number;
  
  // ניתוח לידים
  leadsBySource: { source: string; count: number }[];
  leadsOverTime: { date: string; count: number }[];
  avgResponseTime: number; // בדקות
  
  // ניתוח המרות
  conversionRate: number;
  conversionBySource: { source: string; rate: number }[];
  
  // ביצועי מכירות
  salesByAgent: { agent: string; sales: number; amount: number }[];
  salesOverTime: { date: string; sales: number; amount: number }[];
  
  // ניתוח טמפלייטים
  templatePerformance: { template: string; sent: number; responseRate: number }[];
}

export function useAdvancedAnalytics(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["advanced-analytics", dateRange],
    queryFn: async (): Promise<AdvancedAnalyticsData> => {
      try {
        const fromDate = format(dateRange.from, "yyyy-MM-dd");
        const toDate = format(dateRange.to, "yyyy-MM-dd");
        
        // שליפת לידים בטווח התאריכים
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("*, cars(*)")
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        if (leadsError) throw leadsError;
        
        // שליפת נתוני משתמשים לזיהוי סוכני המכירות
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
          
        if (profilesError) throw profilesError;
        
        // עיבוד הנתונים
        const safeLeads = leads || [];
        const safeProfiles = profiles || [];
        
        const totalLeads = safeLeads.length;
        const totalSales = safeLeads.filter(lead => (lead as any).status === "closed").length;
        const totalCars = new Set(safeLeads.filter(l => (l as any).car_id).map(l => (l as any).car_id)).size;
        
        // חישוב מקורות לידים
        const sources = safeLeads.reduce((acc: Record<string, number>, lead) => {
          const source = (lead as any).source || "לא ידוע";
          if (typeof source === 'string') {
            acc[source] = (acc[source] || 0) + 1;
          }
          return acc;
        }, {});

        const leadsBySource = Object.entries(sources).map(([source, count]) => ({
          source,
          count: count as number,
        }));
        
        // חישוב לידים לאורך זמן
        const leadsByDate = safeLeads.reduce((acc: Record<string, number>, lead) => {
          const createdAt = (lead as any).created_at;
          if (typeof createdAt === 'string') {
            const date = createdAt.split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {});

        const leadsOverTime = Object.entries(leadsByDate)
          .map(([date, count]) => ({
            date,
            count: count as number,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // חישוב זמן תגובה ממוצע (דוגמה מלאכותית כרגע)
        const avgResponseTime = 120; // דוגמה: 120 דקות
        
        // חישוב שיעור המרה
        const conversionRate = totalLeads > 0 ? (totalSales / totalLeads) * 100 : 0;
        
        // חישוב המרות לפי מקור
        const conversionBySource = Object.entries(sources).map(([source, count]) => {
          const sourceLeads = safeLeads.filter(l => (l as any).source === source);
          const sourceSales = sourceLeads.filter(l => (l as any).status === "closed").length;
          return {
            source,
            rate: sourceLeads.length > 0 ? (sourceSales / sourceLeads.length) * 100 : 0,
          };
        });
        
        // חישוב מכירות לפי סוכן
        const salesByAgent = safeProfiles
          .map((profile: any) => {
            const agentLeads = safeLeads.filter(l => (l as any).assigned_to === profile.id);
            const sales = agentLeads.filter(l => (l as any).status === "closed").length;
            const amount = agentLeads
              .filter(l => (l as any).status === "closed" && (l as any).cars && (l as any).cars.price)
              .reduce((sum: number, l: any) => {
                const carPrice = l.cars?.price;
                return sum + (typeof carPrice === 'number' ? carPrice : 0);
              }, 0);
            
            return {
              agent: profile.full_name || profile.id,
              sales,
              amount,
            };
          })
          .filter((agent: any) => agent.sales > 0);
        
        // חישוב מכירות לאורך זמן
        const salesByDate: Record<string, { sales: number; amount: number }> = {};
        
        safeLeads.filter(l => (l as any).status === "closed").forEach((lead: any) => {
          const createdAt = lead.created_at;
          if (typeof createdAt === 'string') {
            const date = createdAt.split("T")[0];
            if (!salesByDate[date]) {
              salesByDate[date] = { sales: 0, amount: 0 };
            }
            salesByDate[date].sales += 1;
            const carPrice = lead.cars?.price;
            salesByDate[date].amount += (typeof carPrice === 'number' ? carPrice : 0);
          }
        });

        const salesOverTime = Object.entries(salesByDate)
          .map(([date, data]) => ({
            date,
            sales: data.sales,
            amount: data.amount,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // דוגמה לביצועי תבניות (יש להחליף בנתונים אמיתיים כשיהיו)
        const templatePerformance = [
          { template: "רכב חדש", sent: 45, responseRate: 68 },
          { template: "הזמנה לנסיעת מבחן", sent: 37, responseRate: 52 },
          { template: "הצעת מחיר", sent: 60, responseRate: 75 },
        ];

        return {
          totalLeads,
          totalCars,
          totalSales,
          leadsBySource,
          leadsOverTime,
          avgResponseTime,
          conversionRate,
          conversionBySource,
          salesByAgent,
          salesOverTime,
          templatePerformance,
        };
      } catch (error) {
        console.error("שגיאה בטעינת נתוני אנליטיקה מתקדמים:", error);
        toast.error("שגיאה בטעינת נתוני אנליטיקה");
        return {
          totalLeads: 0,
          totalCars: 0,
          totalSales: 0,
          leadsBySource: [],
          leadsOverTime: [],
          avgResponseTime: 0,
          conversionRate: 0,
          conversionBySource: [],
          salesByAgent: [],
          salesOverTime: [],
          templatePerformance: [],
        };
      }
    },
  });
}

// Hook לבחירת טווח זמנים
export function useDateRangeAnalytics() {
  return useQuery({
    queryKey: ["analytics-date-ranges"],
    queryFn: async () => {
      const now = new Date();
      
      return {
        thisMonth: {
          label: "החודש",
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: now,
        },
        lastMonth: {
          label: "חודש שעבר",
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(now.getFullYear(), now.getMonth(), 0),
        },
        thisQuarter: {
          label: "רבעון נוכחי",
          from: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
          to: now,
        },
        lastQuarter: {
          label: "רבעון קודם",
          from: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1),
          to: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0),
        },
        thisYear: {
          label: "השנה",
          from: new Date(now.getFullYear(), 0, 1),
          to: now,
        },
        lastYear: {
          label: "שנה שעברה",
          from: new Date(now.getFullYear() - 1, 0, 1),
          to: new Date(now.getFullYear() - 1, 11, 31),
        },
      };
    },
    staleTime: Infinity, // לא משתנה
  });
}
