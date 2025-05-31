
import { MobileButton } from "@/components/mobile/MobileButton";
import { Plus } from "lucide-react";

interface MobileTaskCalendarHeaderProps {
  viewMode: "today" | "upcoming";
  onViewModeChange: (mode: "today" | "upcoming") => void;
  todayCount: number;
  upcomingCount: number;
  onAddTask: () => void;
}

export function MobileTaskCalendarHeader({
  viewMode,
  onViewModeChange,
  todayCount,
  upcomingCount,
  onAddTask
}: MobileTaskCalendarHeaderProps) {
  return (
    <div className="space-y-4" dir="rtl">
      {/* Main header */}
      <div className="text-center py-2">
        <h1 className="text-xl font-semibold text-gray-900 mb-1 text-right">
          ניהול משימות
        </h1>
        <p className="text-sm text-gray-600 text-right">
          {todayCount + upcomingCount} משימות פעילות
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="md"
          onClick={() => onViewModeChange("today")}
          className="flex-1 h-10 text-sm font-medium rounded-lg"
        >
          היום ({todayCount})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="md"
          onClick={() => onViewModeChange("upcoming")}
          className="flex-1 h-10 text-sm font-medium rounded-lg"
        >
          קרובים ({upcomingCount})
        </MobileButton>
      </div>

      {/* Quick Add Task Button */}
      <MobileButton
        variant="primary"
        size="lg"
        onClick={onAddTask}
        icon={<Plus className="h-5 w-5" />}
        className="w-full h-12 text-base font-medium rounded-lg shadow"
      >
        הוסף משימה חדשה
      </MobileButton>
    </div>
  );
}
