
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useSalesAnalytics } from "@/hooks/use-sales-analytics";
import { Skeleton } from "@/components/ui/skeleton";

export function SalesAnalytics() {
  const { data: salesData, isLoading } = useSalesAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">טוען נתוני מכירות...</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!salesData || salesData.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="text-right">ניתוח מכירות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            אין נתוני מכירות להצגה
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-right">ניתוח מכירות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  switch(name) {
                    case 'revenue':
                      return [`₪${value.toLocaleString()}`, 'הכנסות'];
                    case 'convertedLeads':
                      return [value, 'לידים שהומרו'];
                    case 'totalLeads':
                      return [value, 'סה״כ לידים'];
                    default:
                      return [value, name];
                  }
                }}
              />
              <Bar dataKey="totalLeads" fill="hsl(var(--chart-primary))" name="סה״כ לידים" />
              <Bar dataKey="convertedLeads" fill="hsl(var(--chart-secondary))" name="לידים שהומרו" />
              <Bar dataKey="revenue" fill="hsl(var(--chart-tertiary))" name="הכנסות" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
