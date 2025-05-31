
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
    <div className="space-y-4 px-4">
      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="lg"
          onClick={() => onViewModeChange("today")}
          className="flex-1 h-14 text-lg font-semibold rounded-2xl"
        >
          היום ({todayCount})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="lg"
          onClick={() => onViewModeChange("upcoming")}
          className="flex-1 h-14 text-lg font-semibold rounded-2xl"
        >
          קרובים ({upcomingCount})
        </MobileButton>
      </div>

      {/* Quick Add Task Button */}
      <MobileButton
        variant="primary"
        size="lg"
        onClick={onAddTask}
        icon={<Plus className="h-6 w-6" />}
        className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg mobile-gradient-primary"
      >
        הוסף משימה חדשה
      </MobileButton>
    </div>
  );
}
