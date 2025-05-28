
import { Button } from "@/components/ui/button";
import { Calendar, List, Grid3X3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
          className={`${viewMode === "week" ? "bg-[#2F3C7E] hover:bg-[#2F3C7E]/90" : ""} relative`}
        >
          <Grid3X3 className="h-4 w-4 ml-1" />
          שבוע
          <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-gray-200 text-gray-600">
            1
          </Badge>
        </Button>
        
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("calendar")}
          className={`${viewMode === "calendar" ? "bg-[#2F3C7E] hover:bg-[#2F3C7E]/90" : ""} relative`}
        >
          <Calendar className="h-4 w-4 ml-1" />
          חודש
          <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-gray-200 text-gray-600">
            2
          </Badge>
        </Button>
        
        <Button
          variant={viewMode === "agenda" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("agenda")}
          className={`${viewMode === "agenda" ? "bg-[#2F3C7E] hover:bg-[#2F3C7E]/90" : ""} relative`}
        >
          <List className="h-4 w-4 ml-1" />
          רשימה
          <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-gray-200 text-gray-600">
            3
          </Badge>
        </Button>
      </div>
    </div>
  );
}
