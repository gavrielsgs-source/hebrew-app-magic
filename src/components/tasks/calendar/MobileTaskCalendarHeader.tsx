
import { MobileButton } from "@/components/mobile/MobileButton";

interface MobileTaskCalendarHeaderProps {
  viewMode: "today" | "upcoming";
  onViewModeChange: (mode: "today" | "upcoming") => void;
  todayCount: number;
  upcomingCount: number;
}

export function MobileTaskCalendarHeader({
  viewMode,
  onViewModeChange,
  todayCount,
  upcomingCount
}: MobileTaskCalendarHeaderProps) {
  return (
    <div className="space-y-3" dir="rtl">
      {/* Clean header - NO ADD BUTTONS */}
      <div className="bg-gradient-to-r from-carslead-purple to-carslead-blue rounded-xl p-4 shadow-lg">
        <h1 className="text-lg font-semibold text-white mb-1 text-right">
          יומן משימות
        </h1>
        <p className="text-sm text-white/90 text-right">
          {todayCount + upcomingCount} משימות פעילות
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("today")}
          className="flex-1 h-9 text-sm font-medium rounded-lg"
        >
          היום ({todayCount})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("upcoming")}
          className="flex-1 h-9 text-sm font-medium rounded-lg"
        >
          קרובים ({upcomingCount})
        </MobileButton>
      </div>
    </div>
  );
}
