
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
  leadsOverTime: { date: string; count: number }[];
  avgResponseTime: number;
  
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
      leadsOverTime: leadsQuery.data.leadsOverTime,
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
