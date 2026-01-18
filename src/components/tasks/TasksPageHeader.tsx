
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { Calendar, Plus, List, Grid, CheckSquare } from "lucide-react";
import { StandardPageHeader } from "@/components/common/StandardPageHeader";

type ViewMode = "calendar" | "table" | "cards";

interface TasksPageHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function TasksPageHeader({ viewMode, onViewModeChange }: TasksPageHeaderProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <StandardPageHeader
      title="ניהול משימות"
      subtitle="נהל את כל המשימות והפגישות שלך במקום אחד"
      icon={CheckSquare}
      actionButton={{
        label: "הוסף משימה חדשה",
        onClick: () => setIsAddTaskOpen(true),
        icon: Plus
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex border-2 rounded-2xl p-1.5 bg-white/80 backdrop-blur-sm shadow-lg gap-1">
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("calendar")}
            className={`h-9 rounded-xl transition-all duration-200 ${
              viewMode === "calendar" 
                ? "shadow-md" 
                : "hover:bg-muted/60"
            }`}
          >
            <Calendar className="h-4 w-4 ml-1.5" />
            יומן
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("cards")}
            className={`h-9 rounded-xl transition-all duration-200 ${
              viewMode === "cards" 
                ? "shadow-md" 
                : "hover:bg-muted/60"
            }`}
          >
            <Grid className="h-4 w-4 ml-1.5" />
            כרטיסים
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("table")}
            className={`h-9 rounded-xl transition-all duration-200 ${
              viewMode === "table" 
                ? "shadow-md" 
                : "hover:bg-muted/60"
            }`}
          >
            <List className="h-4 w-4 ml-1.5" />
            טבלה
          </Button>
        </div>
      </div>
      
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border-2 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">הוסף משימה חדשה</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => setIsAddTaskOpen(false)} />
        </DialogContent>
      </Dialog>
    </StandardPageHeader>
  );
}
