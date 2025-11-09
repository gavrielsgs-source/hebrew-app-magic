
import { useLeadsAnalytics } from "./use-leads-analytics";
import { useConversionAnalytics } from "./use-conversion-analytics";
import { useSalesAnalytics } from "./use-sales-analytics";
import { useTemplateAnalytics } from "./use-template-analytics";
import { useCarsAnalytics } from "./use-cars-analytics";

export interface AdvancedAnalyticsData {
  // נתונים כלליים
  totalLeads: number;
  totalCars: number;
  totalSales: number;
  
  // ניתוח לידים
  leadsBySource: { source: string; count: number }[];
  leadsOverTime: { month: string; leads: number; sales: number }[];
  avgResponseTime: number;
  
  // ניתוח המרות
  conversionRate: number;
  conversionBySource: { source: string; rate: number }[];
  
  // ביצועי מכירות
  salesByAgent: { agent: string; sales: number; amount: number }[];
  salesOverTime: { month: string; sales: number; amount: number }[];
  
  // ניתוח טמפלייטים
  templatePerformance: { template: string; sent: number; responseRate: number }[];
}

export function useAdvancedAnalytics(dateRange: { from: Date; to: Date }) {
  const leadsQuery = useLeadsAnalytics(dateRange);
  const conversionQuery = useConversionAnalytics(dateRange);
  const salesQuery = useSalesAnalytics(dateRange);
  const templateQuery = useTemplateAnalytics();
  const carsQuery = useCarsAnalytics(dateRange);

  const isLoading = leadsQuery.isLoading || conversionQuery.isLoading || 
                   salesQuery.isLoading || templateQuery.isLoading || carsQuery.isLoading;
  
  const error = leadsQuery.error || conversionQuery.error || 
                salesQuery.error || templateQuery.error || carsQuery.error;

  const data: AdvancedAnalyticsData | undefined = 
    leadsQuery.data && conversionQuery.data && salesQuery.data && 
    templateQuery.data && carsQuery.data ? {
      // נתונים כלליים
      totalLeads: leadsQuery.data.totalLeads,
      totalCars: carsQuery.data.totalCars,
      totalSales: conversionQuery.data.totalSales,
      
      // ניתוח לידים
      leadsBySource: leadsQuery.data.leadsBySource,
      leadsOverTime: combineLeadsAndSalesOverTime(
        leadsQuery.data.leadsOverTime, 
        salesQuery.data.salesOverTime
      ),
      avgResponseTime: leadsQuery.data.avgResponseTime,
      
      // ניתוח המרות
      conversionRate: conversionQuery.data.conversionRate,
      conversionBySource: conversionQuery.data.conversionBySource,
      
      // ביצועי מכירות
      salesByAgent: salesQuery.data.salesByAgent,
      salesOverTime: salesQuery.data.salesOverTime,
      
      // ניתוח טמפלייטים
      templatePerformance: templateQuery.data.templatePerformance,
    } : undefined;

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      leadsQuery.refetch();
      conversionQuery.refetch();
      salesQuery.refetch();
      templateQuery.refetch();
      carsQuery.refetch();
    }
  };
}

// פונקציית עזר לשילוב נתוני לידים ומכירות לפי חודשים
function combineLeadsAndSalesOverTime(
  leadsOverTime: { date: string; count: number }[],
  salesOverTime: { month: string; sales: number; amount: number }[]
): { month: string; leads: number; sales: number }[] {
  const monthlyData: Record<string, { leads: number; sales: number }> = {};
  
  // קיבוץ לידים לפי חודשים
  leadsOverTime.forEach(item => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { leads: 0, sales: 0 };
    }
    monthlyData[monthKey].leads += item.count;
  });
  
  // הוספת מכירות
  salesOverTime.forEach(item => {
    if (!monthlyData[item.month]) {
      monthlyData[item.month] = { leads: 0, sales: 0 };
    }
    monthlyData[item.month].sales = item.sales;
  });
  
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      leads: data.leads,
      sales: data.sales,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
