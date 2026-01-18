
import { Button } from "@/components/ui/button";
import { Calendar, List, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  viewMode: "calendar" | "agenda" | "week";
  onViewModeChange: (mode: "calendar" | "agenda" | "week") => void;
}

export function CalendarHeader({ viewMode, onViewModeChange }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-foreground">יומן משימות</h3>
      
      <div className="flex gap-1.5 p-1.5 bg-muted/50 rounded-xl border-2 border-border/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("week")}
          className={cn(
            "relative rounded-lg h-9 px-4 font-semibold transition-all duration-200",
            viewMode === "week" 
              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          <Grid3X3 className="h-4 w-4 ml-1.5" />
          שבוע
          <span className={cn(
            "absolute -top-1.5 -right-1.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold",
            viewMode === "week" 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            1
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("calendar")}
          className={cn(
            "relative rounded-lg h-9 px-4 font-semibold transition-all duration-200",
            viewMode === "calendar" 
              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          <Calendar className="h-4 w-4 ml-1.5" />
          חודש
          <span className={cn(
            "absolute -top-1.5 -right-1.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold",
            viewMode === "calendar" 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            2
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("agenda")}
          className={cn(
            "relative rounded-lg h-9 px-4 font-semibold transition-all duration-200",
            viewMode === "agenda" 
              ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          <List className="h-4 w-4 ml-1.5" />
          רשימה
          <span className={cn(
            "absolute -top-1.5 -right-1.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold",
            viewMode === "agenda" 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            3
          </span>
        </Button>
      </div>
    </div>
  );
}
