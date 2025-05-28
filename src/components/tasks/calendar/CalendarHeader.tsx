
import { Button } from "@/components/ui/button";
import { Calendar, List, Grid3X3 } from "lucide-react";

interface CalendarHeaderProps {
  viewMode: "calendar" | "agenda" | "week";
  onViewModeChange: (mode: "calendar" | "agenda" | "week") => void;
}

export function CalendarHeader({ viewMode, onViewModeChange }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-[#2F3C7E]">יומן משימות</h3>
      
      <div className="flex gap-2">
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("week")}
          className={viewMode === "week" ? "bg-[#2F3C7E] hover:bg-[#2F3C7E]/90" : ""}
        >
          <Grid3X3 className="h-4 w-4 ml-1" />
          שבוע
        </Button>
        
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("calendar")}
          className={viewMode === "calendar" ? "bg-[#2F3C7E] hover:bg-[#2F3C7E]/90" : ""}
        >
          <Calendar className="h-4 w-4 ml-1" />
          חודש
        </Button>
        
        <Button
          variant={viewMode === "agenda" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("agenda")}
          className={viewMode === "agenda" ? "bg-[#2F3C7E] hover:bg-[#2F3C7E]/90" : ""}
        >
          <List className="h-4 w-4 ml-1" />
          רשימה
        </Button>
      </div>
    </div>
  );
}
