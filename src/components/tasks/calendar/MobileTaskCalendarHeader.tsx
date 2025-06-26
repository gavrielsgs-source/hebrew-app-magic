
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
      {/* Header with brand colors */}
      <div className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] rounded-3xl p-6 shadow-xl border border-white/20">
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
              ? "bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] text-white border-0" 
              : "border-[#2F3C7E] text-[#2F3C7E] hover:bg-gradient-to-r hover:from-[#2F3C7E] hover:to-[#4CAF50] hover:text-white"
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
              ? "bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] text-white border-0" 
              : "border-[#2F3C7E] text-[#2F3C7E] hover:bg-gradient-to-r hover:from-[#2F3C7E] hover:to-[#4CAF50] hover:text-white"
          }`}
        >
          קרובים ({upcomingCount})
        </MobileButton>
      </div>
    </div>
  );
}
