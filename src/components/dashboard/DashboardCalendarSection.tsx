
import { Card, CardContent } from "@/components/ui/card";
import { MiniCalendar } from "@/components/calendar/MiniCalendar";

export function DashboardCalendarSection() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">יומן משימות</h2>
        <p className="text-gray-600">מבט כולל על כל המשימות והפגישות שלך</p>
      </div>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <MiniCalendar />
        </CardContent>
      </Card>
    </div>
  );
}
