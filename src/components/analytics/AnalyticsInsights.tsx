import { AdvancedAnalyticsData } from "@/hooks/analytics";

export function generateLeadsBySourceInsight(data: AdvancedAnalyticsData) {
  if (!data.leadsBySource || data.leadsBySource.length === 0) {
    return {
      title: "אין מספיק נתונים",
      description: "עדיין לא נאספו נתונים על מקורות הלידים",
      type: "info" as const
    };
  }

  const topSource = data.leadsBySource.reduce((prev, current) => 
    (prev.count > current.count) ? prev : current
  );
  
  const totalLeads = data.leadsBySource.reduce((sum, source) => sum + source.count, 0);
  const topSourcePercentage = ((topSource.count / totalLeads) * 100).toFixed(0);

  if (topSource.count < 5) {
    return {
      title: "מעט לידים",
      description: `המקור הטוב ביותר הוא "${topSource.source}" עם ${topSource.count} לידים - נסה להגביר את הפעילות השיווקית`,
      type: "warning" as const
    };
  }

  return {
    title: "מקור הלידים המוביל",
    description: `"${topSource.source}" מביא ${topSourcePercentage}% מהלידים (${topSource.count} לידים) - כדאי להשקיע יותר במקור זה`,
    type: "success" as const,
    trend: "up" as const,
    percentage: parseInt(topSourcePercentage)
  };
}

export function generateConversionInsight(data: AdvancedAnalyticsData) {
  const rate = data.conversionRate || 0;
  
  if (rate >= 25) {
    return {
      title: "שיעור המרה מעולה!",
      description: `שיעור המרה של ${rate.toFixed(1)}% נחשב מעולה בתחום - המשך כך!`,
      type: "success" as const,
      trend: "up" as const,
      percentage: Math.round(rate)
    };
  }
  
  if (rate >= 15) {
    return {
      title: "שיעור המרה טוב",
      description: `שיעור המרה של ${rate.toFixed(1)}% הוא סביר - יש מקום לשיפור במעקב אחרי לידים`,
      type: "info" as const,
      trend: "stable" as const,
      percentage: Math.round(rate)
    };
  }
  
  return {
    title: "שיעור המרה נמוך",
    description: `שיעור המרה של ${rate.toFixed(1)}% נמוך מהמומלץ (15%) - שפר את זמני התגובה והמעקב אחרי לידים`,
    type: "warning" as const,
    trend: "down" as const,
    percentage: Math.round(rate)
  };
}

export function generateResponseTimeInsight(data: AdvancedAnalyticsData) {
  const time = data.avgResponseTime || 0;
  
  if (time <= 30) {
    return {
      title: "זמן תגובה מצוין!",
      description: `זמן תגובה ממוצע של ${time} דקות הוא מהיר מאוד - לקוחות יעריכו את השירות המהיר`,
      type: "success" as const,
      trend: "up" as const
    };
  }
  
  if (time <= 60) {
    return {
      title: "זמן תגובה טוב",
      description: `זמן תגובה של ${time} דקות הוא סביר - נסה לרדת מתחת לחצי שעה`,
      type: "info" as const,
      trend: "stable" as const
    };
  }
  
  if (time <= 120) {
    return {
      title: "זמן תגובה איטי",
      description: `זמן תגובה של ${Math.round(time/60)} שעות איטי מדי - שפר את ההתראות והתגובה המיידית`,
      type: "warning" as const,
      trend: "down" as const
    };
  }
  
  return {
    title: "זמן תגובה איטי מאוד",
    description: `זמן תגובה של ${Math.round(time/60)} שעות דורש שיפור דחוף - הוסף התראות SMS/WhatsApp ללידים חדשים`,
    type: "danger" as const,
    trend: "down" as const
  };
}

export function generateSalesOverTimeInsight(data: AdvancedAnalyticsData) {
  if (!data.salesOverTime || data.salesOverTime.length === 0) {
    return {
      title: "אין נתוני מכירות",
      description: "עדיין לא נאספו נתונים על מכירות - התחל לסגור עסקאות!",
      type: "info" as const
    };
  }

  const recentSales = data.salesOverTime.slice(-7);
  const totalRecentSales = recentSales.reduce((sum, day) => sum + day.sales, 0);
  
  if (totalRecentSales === 0) {
    return {
      title: "ירידה במכירות",
      description: "לא היו מכירות בשבוע האחרון - בדוק את תהליך הסגירה ומעקב הלידים",
      type: "danger" as const,
      trend: "down" as const
    };
  }
  
  if (totalRecentSales >= 5) {
    return {
      title: "מכירות מצוינות!",
      description: `${totalRecentSales} מכירות בשבוע האחרון - ביצועים מעולים!`,
      type: "success" as const,
      trend: "up" as const
    };
  }
  
  return {
    title: "מכירות יציבות",
    description: `${totalRecentSales} מכירות בשבוע האחרון - נסה להגביר את הפעילות למכירות נוספות`,
    type: "info" as const,
    trend: "stable" as const
  };
}
