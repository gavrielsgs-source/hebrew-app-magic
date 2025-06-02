
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { SubscriptionLimitAlert } from "@/components/subscription/SubscriptionLimitAlert";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { LimitAwareButton } from "@/components/subscription/LimitAwareButton";
import { Plus } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";

export function AddTaskFormWithLimits() {
  const { tasks } = useTasks();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [taskCount, setTaskCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setTaskCount(tasks?.length || 0);
  }, [tasks]);

  const handleAddTask = () => {
    const canProceed = checkAndNotifyLimit('task', taskCount);
    if (canProceed) {
      setIsAddDialogOpen(true);
    }
  };

  return (
    <>
      <SubscriptionLimitAlert 
        featureKey="taskLimit" 
        currentCount={taskCount} 
        entityName="משימות" 
      />
      
      <LimitAwareButton 
        resourceType="task"
        currentCount={taskCount}
        onAction={handleAddTask}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="ml-2 h-4 w-4" />
        הוסף משימה
      </LimitAwareButton>
      
      <AddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </>
  );
}
