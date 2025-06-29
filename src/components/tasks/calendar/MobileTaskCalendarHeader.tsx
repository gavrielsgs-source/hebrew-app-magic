
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
      {/* Clean header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-[#2F3C7E] mb-2 text-right">
          יומן משימות
        </h1>
        <p className="text-base text-gray-600 text-right">
          {todayCount + upcomingCount} משימות פעילות
        </p>
      </div>

      {/* Clean View Mode Toggle */}
      <div className="flex gap-3">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("today")}
          className={`flex-1 h-12 text-base font-semibold rounded-2xl shadow-sm transition-all duration-300 border-2 ${
            viewMode === "today" 
              ? "bg-[#2F3C7E] text-white border-[#2F3C7E]" 
              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#2F3C7E] hover:text-[#2F3C7E]"
          }`}
        >
          היום ({todayCount})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("upcoming")}
          className={`flex-1 h-12 text-base font-semibold rounded-2xl shadow-sm transition-all duration-300 border-2 ${
            viewMode === "upcoming" 
              ? "bg-[#2F3C7E] text-white border-[#2F3C7E]" 
              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#2F3C7E] hover:text-[#2F3C7E]"
          }`}
        >
          קרובים ({upcomingCount})
        </MobileButton>
      </div>
    </div>
  );
}
