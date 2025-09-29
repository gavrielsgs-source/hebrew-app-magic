
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
        <div className="flex border rounded-lg p-1 bg-white shadow-sm">
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("calendar")}
            className="h-8"
          >
            <Calendar className="h-4 w-4 mr-1" />
            יומן
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("cards")}
            className="h-8"
          >
            <Grid className="h-4 w-4 mr-1" />
            כרטיסים
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("table")}
            className="h-8"
          >
            <List className="h-4 w-4 mr-1" />
            טבלה
          </Button>
        </div>
      </div>
      
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הוסף משימה חדשה</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => setIsAddTaskOpen(false)} />
        </DialogContent>
      </Dialog>
    </StandardPageHeader>
  );
}
