
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { Calendar, Plus, List, Grid } from "lucide-react";

type ViewMode = "calendar" | "table" | "cards";

interface TasksPageHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function TasksPageHeader({ viewMode, onViewModeChange }: TasksPageHeaderProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-[#2F3C7E]">ניהול משימות</h2>
      
      <div className="flex items-center gap-3">
        <div className="flex border rounded-lg p-1 bg-gray-50">
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
        
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] hover:from-[#1F2C5E] hover:to-[#3A4A7C] text-white shadow-lg">
              <Plus className="ml-2 h-4 w-4" />
              הוסף משימה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>הוסף משימה חדשה</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setIsAddTaskOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
