
import { Button } from "@/components/ui/button";
import { CheckSquare, Bell } from "lucide-react";
import { useState } from "react";
import { type Task } from "@/types/task";

interface TaskCardFooterProps {
  task: Task;
  onStatusChange: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TaskCardFooter({ task, onStatusChange, onDelete }: TaskCardFooterProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 pt-4">
      <Button 
        variant={task.status === "completed" ? "default" : "outline"}
        className={`flex-1 rounded-xl font-medium ${task.status === "completed" ? "bg-[#4CAF50] hover:bg-[#4CAF50]/90" : "border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white"}`}
        onClick={() => onStatusChange(task.id, task.status !== "completed")}
      >
        <CheckSquare className="h-4 w-4 ml-2" />
        {task.status === "completed" ? "הושלם" : "סמן כהושלם"}
      </Button>
      
      <Button 
        variant="outline"
        className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white rounded-xl"
        onClick={() => {
          // Add reminder functionality here
          console.log("Setting reminder for task:", task.id);
        }}
      >
        <Bell className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="destructive" 
        className="rounded-xl"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        מחק
      </Button>
    </div>
  );
}
