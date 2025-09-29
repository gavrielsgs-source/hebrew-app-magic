
import { Card, CardContent } from "@/components/ui/card";
import { MiniCalendar } from "@/components/calendar/MiniCalendar";

export function DashboardCalendarSection() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">יומן משימות</h2>
        <p className="text-lg text-slate-600">מבט כולל על כל המשימות והפגישות שלך</p>
      </div>
      
      <Card className="bg-gradient-to-br from-white to-slate-50 shadow-2xl rounded-3xl border-0">
        <CardContent className="p-8">
          <MiniCalendar />
        </CardContent>
      </Card>
    </div>
  );
}
