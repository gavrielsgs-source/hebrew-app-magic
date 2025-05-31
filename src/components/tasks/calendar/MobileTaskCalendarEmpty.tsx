
import { MobileCard } from "@/components/mobile/MobileCard";
import { Calendar } from "lucide-react";

interface MobileTaskCalendarEmptyProps {
  viewMode: "today" | "upcoming";
}

export function MobileTaskCalendarEmpty({ viewMode }: MobileTaskCalendarEmptyProps) {
  return (
    <MobileCard className="py-12 text-center mobile-gradient-card">
      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p className="text-lg font-medium mb-1 text-gray-600">
        {viewMode === "today" ? "אין משימות להיום" : "אין משימות עתידיות"}
      </p>
      <p className="text-sm text-gray-500">
        {viewMode === "today" ? "תיהנה מיום פנוי! 🎉" : "הכל נראה שקט לעת עתה"}
      </p>
    </MobileCard>
  );
}
