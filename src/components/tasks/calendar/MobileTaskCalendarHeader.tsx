
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
    <div className="space-y-6" dir="rtl">
      {/* Main header - better RTL alignment */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-[#2F3C7E] mb-2 text-right">
          ניהול משימות
        </h1>
        <p className="text-lg text-gray-600 text-right">
          {todayCount + upcomingCount} משימות פעילות
        </p>
      </div>

      {/* View Mode Toggle - larger touch targets */}
      <div className="flex gap-3">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="lg"
          onClick={() => onViewModeChange("today")}
          className="flex-1 h-16 text-xl font-bold rounded-3xl mobile-touch-target"
        >
          היום ({todayCount})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="lg"
          onClick={() => onViewModeChange("upcoming")}
          className="flex-1 h-16 text-xl font-bold rounded-3xl mobile-touch-target"
        >
          קרובים ({upcomingCount})
        </MobileButton>
      </div>

      {/* Quick Add Task Button - enhanced with better spacing */}
      <MobileButton
        variant="primary"
        size="lg"
        onClick={onAddTask}
        icon={<Plus className="h-8 w-8" />}
        className="w-full h-20 text-2xl font-bold rounded-3xl shadow-lg mobile-gradient-primary mobile-large-touch-target"
      >
        הוסף משימה חדשה
      </MobileButton>
    </div>
  );
}
