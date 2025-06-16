
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
    <div className="space-y-4" dir="rtl">
      {/* Unified header with brand gradient */}
      <div className="bg-carslead-gradient rounded-3xl p-6 shadow-xl border border-white/20">
        <h1 className="text-xl font-bold text-white mb-2 text-right">
          יומן משימות
        </h1>
        <p className="text-base text-white/90 text-right">
          {todayCount + upcomingCount} משימות פעילות
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-3">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("today")}
          className={`flex-1 h-12 text-base font-semibold rounded-2xl shadow-md transition-all duration-300 ${
            viewMode === "today" 
              ? "bg-carslead-gradient text-white border-0" 
              : "border-carslead-purple text-carslead-purple hover:bg-carslead-purple hover:text-white"
          }`}
        >
          היום ({todayCount})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("upcoming")}
          className={`flex-1 h-12 text-base font-semibold rounded-2xl shadow-md transition-all duration-300 ${
            viewMode === "upcoming" 
              ? "bg-carslead-gradient text-white border-0" 
              : "border-carslead-purple text-carslead-purple hover:bg-carslead-purple hover:text-white"
          }`}
        >
          קרובים ({upcomingCount})
        </MobileButton>
      </div>
    </div>
  );
}
