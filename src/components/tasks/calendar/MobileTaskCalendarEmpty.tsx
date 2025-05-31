
import { MobileCard } from "@/components/mobile/MobileCard";
import { Calendar } from "lucide-react";

interface MobileTaskCalendarEmptyProps {
  viewMode: "today" | "upcoming";
}

export function MobileTaskCalendarEmpty({ viewMode }: MobileTaskCalendarEmptyProps) {
  return (
    <div dir="rtl">
      <MobileCard className="py-20 text-center mobile-gradient-card mx-4 rounded-3xl">
        <Calendar className="h-20 w-20 mx-auto mb-6 text-gray-300" />
        <h3 className="text-2xl font-bold mb-4 text-gray-600 text-right">
          {viewMode === "today" ? "אין משימות להיום" : "אין משימות עתידיות"}
        </h3>
        <p className="text-xl text-gray-500 text-right">
          {viewMode === "today" ? "תיהנה מיום פנוי! 🎉" : "הכל נראה שקט לעת עתה"}
        </p>
      </MobileCard>
    </div>
  );
}
