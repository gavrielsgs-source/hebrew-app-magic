
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { taskFormSchema, type TaskFormValues } from "@/types/task";
import { type TaskFormProps } from "./TaskFormTypes";

export function useTaskForm({ onSuccess, initialLeadId, initialCarId, initialDate }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldCreateNotification, setShouldCreateNotification] = useState(false);
  const [selectedNotificationOptions, setSelectedNotificationOptions] = useState<string[]>([]);

  const { toast } = useToast();
  const { addTask } = useTasks();
  const { scheduleNotification, permission } = usePushNotifications();

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
      due_date: initialDate || undefined,
    },
  });

  const getMinutesFromOption = (option: string): number => {
    switch (option) {
      case "5_minutes": return 5;
      case "30_minutes": return 30;
      case "1_hour": return 60;
      case "24_hours": return 1440;
      default: return 30;
    }
  };

  const onSubmit = async (data: TaskFormValues) => {
    console.log("Starting task submission with data:", data);
    setIsSubmitting(true);
    
    try {
      // Ensure status is one of the valid values
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      const validTypes = ['task', 'call', 'meeting', 'follow_up'];
      
      const taskStatus = validStatuses.includes(data.status) ? data.status : 'pending';
      const taskType = validTypes.includes(data.type) ? data.type : 'task';
      
      const isValidUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      
      const leadId = (data.lead_id && data.lead_id !== "none" && data.lead_id !== "" && isValidUUID(data.lead_id)) ? data.lead_id : null;
      const carId = (data.car_id && data.car_id !== "none" && data.car_id !== "" && isValidUUID(data.car_id)) ? data.car_id : null;

      const taskData = {
        title: data.title,
        description: data.description || null,
        status: taskStatus,
        priority: data.priority,
        type: taskType,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        lead_id: leadId,
        car_id: carId,
      };

      console.log("Submitting task data:", taskData);

      const newTask = await addTask.mutateAsync(taskData);
      console.log("Task created successfully:", newTask);
      
      // Create notifications if requested and due date is set
      if (shouldCreateNotification && data.due_date && newTask && selectedNotificationOptions.length > 0) {
        console.log("Creating notifications for task:", newTask.id || 'unknown');
        
        for (const option of selectedNotificationOptions) {
          const minutesBefore = getMinutesFromOption(option);
          const reminderTime = new Date(data.due_date.getTime() - minutesBefore * 60 * 1000);
          
          try {
            await scheduleNotification(
              `תזכורת למשימה: ${data.title}`,
              `המשימה מתחילה בעוד ${getNotificationTimeText(option)}`,
              reminderTime,
              taskType,
              "task",
              newTask.id || ''
            );
          } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
          }
        }
        console.log(`Created ${selectedNotificationOptions.length} notifications`);
      }
      
      let successMessage = "המשימה נוצרה בהצלחה";
      if (shouldCreateNotification && selectedNotificationOptions.length > 0) {
        successMessage = `המשימה נוצרה והתזכורות נקבעו (${selectedNotificationOptions.length} תזכורות)`;
      }
      
      toast({
        title: "משימה נוצרה",
        description: successMessage,
      });
      
      form.reset();
      setShouldCreateNotification(false);
      setSelectedNotificationOptions([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "שגיאה ביצירת משימה",
        description: "לא ניתן ליצור את המשימה. נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNotificationTimeText = (option: string): string => {
    switch (option) {
      case "5_minutes": return "5 דקות";
      case "30_minutes": return "30 דקות";
      case "1_hour": return "שעה";
      case "24_hours": return "24 שעות";
      default: return "30 דקות";
    }
  };

  return {
    form,
    isSubmitting,
    shouldCreateNotification,
    setShouldCreateNotification,
    selectedNotificationOptions,
    setSelectedNotificationOptions,
    permission,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
