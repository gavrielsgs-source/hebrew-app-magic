
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
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex gap-3">
        <MobileButton
          variant={viewMode === "today" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("today")}
          className="flex-1"
        >
          היום ({todayCount})
        </MobileButton>
        <MobileButton
          variant={viewMode === "upcoming" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("upcoming")}
          className="flex-1"
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
        className="w-full rounded-full shadow-lg mobile-gradient-primary"
      >
        הוסף משימה חדשה
      </MobileButton>
    </div>
  );
}
