
import { useQuery } from "@tanstack/react-query";

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
          to: new Date(now.getFullYear(), now.getMonth() / 3) * 3, 0),
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
