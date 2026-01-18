
import { MobileCard } from "@/components/mobile/MobileCard";
import { Calendar, CheckCircle2 } from "lucide-react";

interface MobileTaskCalendarEmptyProps {
  viewMode: "today" | "upcoming";
}

export function MobileTaskCalendarEmpty({ viewMode }: MobileTaskCalendarEmptyProps) {
  return (
    <div dir="rtl">
      <MobileCard className="py-16 text-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/20">
        <div className="p-5 bg-muted/50 rounded-full w-fit mx-auto mb-5">
          {viewMode === "today" ? (
            <CheckCircle2 className="h-16 w-16 text-muted-foreground/40" />
          ) : (
            <Calendar className="h-16 w-16 text-muted-foreground/40" />
          )}
        </div>
        <h3 className="text-xl font-bold mb-3 text-foreground">
          {viewMode === "today" ? "אין משימות להיום" : "אין משימות עתידיות"}
        </h3>
        <p className="text-base text-muted-foreground">
          {viewMode === "today" ? "תיהנה מיום פנוי! 🎉" : "הכל נראה שקט לעת עתה ✨"}
        </p>
      </MobileCard>
    </div>
  );
}
