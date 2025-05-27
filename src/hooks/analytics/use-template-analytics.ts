
import { useQuery } from "@tanstack/react-query";

export interface TemplateAnalyticsData {
  templatePerformance: { template: string; sent: number; responseRate: number }[];
}

export function useTemplateAnalytics() {
  return useQuery({
    queryKey: ["template-analytics"],
    queryFn: async (): Promise<TemplateAnalyticsData> => {
      // דוגמה לביצועי תבניות (יש להחליף בנתונים אמיתיים כשיהיו)
      const templatePerformance = [
        { template: "רכב חדש", sent: 45, responseRate: 68 },
        { template: "הזמנה לנסיעת מבחן", sent: 37, responseRate: 52 },
        { template: "הצעת מחיר", sent: 60, responseRate: 75 },
      ];

      return {
        templatePerformance,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
