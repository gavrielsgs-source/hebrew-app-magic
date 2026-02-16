
import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { NotificationCheckbox } from "@/components/notifications/NotificationCheckbox";
import { TaskBasicDetails } from "./TaskBasicDetails";
import { TaskDateAndStatus } from "./TaskDateAndStatus";
import { TaskTypeAndPriority } from "./TaskTypeAndPriority";
import { TaskRelations } from "./TaskRelations";
import { useTaskForm } from "./useTaskForm";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/types/task";
import type { TaskFormProps } from "./TaskFormTypes";

interface EditTaskFormProps extends TaskFormProps {
  task: Task;
  isMobile?: boolean;
}

export function EditTaskForm({ task, onSuccess, isMobile = false }: EditTaskFormProps) {
  const { updateTask } = useTasks();
  const { toast } = useToast();
  
  const {
    form,
    isSubmitting,
    shouldCreateNotification,
    setShouldCreateNotification,
    selectedNotificationOptions,
    setSelectedNotificationOptions,
    permission,
  } = useTaskForm({ onSuccess });

  // Pre-populate form with task data
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority as "low" | "medium" | "high",
        type: task.type as "call" | "meeting" | "follow_up" | "task",
        status: task.status as "pending" | "in_progress" | "completed",
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        lead_id: task.lead_id || "",
        car_id: task.car_id || "",
      });
    }
  }, [task, form]);

  const onSubmit = async (data: any) => {
    console.log("Starting task update with data:", data);
    
    try {
      const taskData = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        type: data.type,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        lead_id: data.lead_id === "none" || !data.lead_id ? null : data.lead_id,
        car_id: data.car_id === "none" || !data.car_id ? null : data.car_id,
      };

      console.log("Updating task data:", taskData);

      await updateTask.mutateAsync({
        id: task.id,
        data: taskData
      });
      
      toast({
        title: "משימה עודכנה",
        description: "המשימה עודכנה בהצלחה",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "שגיאה בעדכון משימה",
        description: "לא ניתן לעדכן את המשימה. נסה שנית.",
        variant: "destructive",
      });
    }
  };

  const watchedDueDate = form.watch("due_date");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TaskBasicDetails />
        <TaskDateAndStatus hiddenOnMobile={isMobile} />
        {!isMobile && <TaskTypeAndPriority />}
        {!isMobile && <TaskRelations />}
        
        {/* Notification Option */}
        {watchedDueDate && (
          <NotificationCheckbox
            checked={shouldCreateNotification}
            onCheckedChange={setShouldCreateNotification}
            label="עדכן תזכורות למשימה"
            disabled={permission !== "granted"}
            showOptions={true}
            selectedOptions={selectedNotificationOptions}
            onOptionsChange={setSelectedNotificationOptions}
          />
        )}
        
        <div className="flex gap-3 pt-6">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 text-white rounded-xl h-12 text-base font-medium"
          >
            {isSubmitting ? "מעדכן משימה..." : "עדכן משימה"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
