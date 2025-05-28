
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

interface CalendarHeaderProps {
  viewMode: "calendar" | "agenda";
  onViewModeChange: (mode: "calendar" | "agenda") => void;
}

export function CalendarHeader({ viewMode, onViewModeChange }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-bold text-[#2F3C7E] flex items-center gap-2">
        <CalendarIcon className="h-5 w-5" />
        יומן משימות
      </CardTitle>
      <div className="flex gap-2">
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("calendar")}
          className="text-sm"
        >
          לוח שנה
        </Button>
        <Button
          variant={viewMode === "agenda" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("agenda")}
          className="text-sm"
        >
          סדר יום
        </Button>
      </div>
    </div>
  );
}
