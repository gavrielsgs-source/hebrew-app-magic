
import { MobileCard } from "@/components/mobile/MobileCard";
import { Calendar } from "lucide-react";

interface MobileTaskCalendarEmptyProps {
  viewMode: "today" | "upcoming";
}

export function MobileTaskCalendarEmpty({ viewMode }: MobileTaskCalendarEmptyProps) {
  return (
    <MobileCard className="py-16 text-center mobile-gradient-card mx-4">
      <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
      <p className="text-xl font-semibold mb-2 text-gray-600">
        {viewMode === "today" ? "אין משימות להיום" : "אין משימות עתידיות"}
      </p>
      <p className="text-base text-gray-500">
        {viewMode === "today" ? "תיהנה מיום פנוי! 🎉" : "הכל נראה שקט לעת עתה"}
      </p>
    </MobileCard>
  );
}
