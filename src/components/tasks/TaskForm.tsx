
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { TaskBasicDetails } from "./form/TaskBasicDetails";
import { TaskDateAndStatus } from "./form/TaskDateAndStatus";
import { TaskTypeAndPriority } from "./form/TaskTypeAndPriority";
import { TaskRelations } from "./form/TaskRelations";
import { NotificationCheckbox } from "@/components/notifications/NotificationCheckbox";

const taskFormSchema = z.object({
  title: z.string().min(1, "כותרת המשימה חובה"),
  description: z.string().optional(),
  due_date: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  type: z.enum(["call", "meeting", "follow_up", "task"]).default("task"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  lead_id: z.string().optional(),
  car_id: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
  initialLeadId?: string;
  initialCarId?: string;
}

export function TaskForm({ onSuccess, initialLeadId, initialCarId }: TaskFormProps) {
  const { addTask } = useTasks();
  const { toast } = useToast();
  const { scheduleNotification, permission } = usePushNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldCreateNotification, setShouldCreateNotification] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      type: "task",
      status: "pending",
      lead_id: initialLeadId || "",
      car_id: initialCarId || "",
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const taskData = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        type: data.type,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        lead_id: data.lead_id || null,
        car_id: data.car_id || null,
      };

      const newTask = await addTask.mutateAsync(taskData);
      
      // Create notification if requested and due date is set
      if (shouldCreateNotification && data.due_date && newTask && newTask[0]) {
        const reminderTime = new Date(data.due_date.getTime() - 30 * 60 * 1000); // 30 minutes before
        await scheduleNotification(
          `תזכורת למשימה: ${data.title}`,
          `המשימה מתחילה בעוד 30 דקות`,
          reminderTime,
          data.type,
          "task",
          newTask[0].id
        );
      }
      
      toast({
        title: "משימה נוצרה",
        description: shouldCreateNotification ? "המשימה נוצרה והתזכורת נקבעה" : "המשימה נוצרה בהצלחה",
      });
      
      form.reset();
      setShouldCreateNotification(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "שגיאה ביצירת משימה",
        description: "לא ניתן ליצור את המשימה. נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedDueDate = form.watch("due_date");

  return (
    <div className="space-y-6" dir="rtl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TaskBasicDetails />
          <TaskDateAndStatus />
          <TaskTypeAndPriority />
          <TaskRelations />
          
          {/* Notification Option */}
          {watchedDueDate && (
            <NotificationCheckbox
              checked={shouldCreateNotification}
              onCheckedChange={setShouldCreateNotification}
              label="צור תזכורת 30 דקות לפני המשימה"
              disabled={permission !== "granted"}
            />
          )}
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 text-white rounded-xl"
            >
              {isSubmitting ? "יוצר..." : "צור משימה"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
