import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { SubscriptionTimeline } from "@/hooks/use-admin-subscriptions";

interface SubscriptionAnalyticsProps {
  timeline: SubscriptionTimeline[];
}

export function SubscriptionAnalytics({ timeline }: SubscriptionAnalyticsProps) {
  // המרת הנתונים לפורמט מתאים לגרפים
  const chartData = timeline.map(item => ({
    month: item.month,
    פעילים: item.active,
    ניסיון: item.trial,
    "פג תוקף": item.expired,
    מבוטלים: item.cancelled,
  })).reverse();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-right">מנויים לאורך זמן - גרף עמודות</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="פעילים" fill="#10b981" />
              <Bar dataKey="ניסיון" fill="#f59e0b" />
              <Bar dataKey="פג תוקף" fill="#ef4444" />
              <Bar dataKey="מבוטלים" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">מגמות מנויים - גרף קווים</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="פעילים" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="ניסיון" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="פג תוקף" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
