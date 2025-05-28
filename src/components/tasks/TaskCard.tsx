import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TaskCardHeader } from "./components/TaskCardHeader";
import { TaskCardContent } from "./components/TaskCardContent";
import { TaskCardFooter } from "./components/TaskCardFooter";
import { isToday, isPast, isFuture } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard } from "@/components/mobile/MobileCard";
import { type Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const isMobile = useIsMobile();

  // Determine card color based on due date
  const getCardColorClass = () => {
    if (!task.due_date) return "bg-gray-50 border-gray-200";
    
    const dueDate = new Date(task.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return "bg-red-50 border-red-200 shadow-red-100";
    } else if (isToday(dueDate)) {
      return "bg-yellow-50 border-yellow-200 shadow-yellow-100";
    } else if (isFuture(dueDate)) {
      return "bg-blue-50 border-blue-200 shadow-blue-100";
    }
    
    return "bg-gray-50 border-gray-200";
  };

  if (isMobile) {
    return (
      <MobileCard className={`${getCardColorClass()} transition-all duration-300`} dir="rtl">
        <div className="p-5 space-y-4">
          <TaskCardHeader task={task} />
          <TaskCardContent task={task} />
          <TaskCardFooter 
            task={task} 
            onStatusChange={onStatusChange} 
            onDelete={onDelete} 
          />
        </div>
      </MobileCard>
    );
  }

  // Desktop version - keep existing code
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${getCardColorClass()} rounded-2xl`} dir="rtl">
      <CardHeader className="space-y-3 pb-4">
        <TaskCardHeader task={task} />
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4">
        <TaskCardContent task={task} />
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4">
        <TaskCardFooter 
          task={task} 
          onStatusChange={onStatusChange} 
          onDelete={onDelete} 
        />
      </CardFooter>
    </Card>
  );
}
