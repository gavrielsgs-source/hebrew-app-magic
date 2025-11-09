
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useSalesAnalytics } from "@/hooks/analytics/use-sales-analytics";
import { Skeleton } from "@/components/ui/skeleton";

export function SalesAnalytics() {
  const dateRange = {
    from: new Date(new Date().getFullYear(), 0, 1), // תחילת השנה
    to: new Date()
  };
  const { data: salesData, isLoading } = useSalesAnalytics(dateRange);

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

  if (!salesData || salesData.salesOverTime.length === 0) {
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
            <BarChart data={salesData.salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  switch(name) {
                    case 'amount':
                      return [`₪${value.toLocaleString()}`, 'הכנסות'];
                    case 'sales':
                      return [value, 'מכירות'];
                    default:
                      return [value, name];
                  }
                }}
              />
              <Bar dataKey="sales" fill="hsl(var(--chart-primary))" name="מכירות" />
              <Bar dataKey="amount" fill="hsl(var(--chart-secondary))" name="הכנסות (₪)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
