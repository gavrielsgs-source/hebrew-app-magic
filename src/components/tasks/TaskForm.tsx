
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
  console.log('TaskForm component rendering with props:', { initialLeadId, initialCarId });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldCreateNotification, setShouldCreateNotification] = useState(false);
  const [selectedNotificationOptions, setSelectedNotificationOptions] = useState<string[]>([]);

  const { toast } = useToast();
  
  // Initialize hooks with comprehensive error handling
  let addTask, scheduleNotification, permission;
  try {
    console.log('Initializing hooks in TaskForm...');
    const tasksHook = useTasks();
    addTask = tasksHook.addTask;
    console.log('useTasks hook initialized successfully');
    
    const pushNotifications = usePushNotifications();
    scheduleNotification = pushNotifications.scheduleNotification;
    permission = pushNotifications.permission;
    console.log('usePushNotifications hook initialized successfully');
  } catch (error) {
    console.error('Critical error initializing hooks in TaskForm:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בטעינת טופס המשימה",
      variant: "destructive",
    });
    return (
      <div className="p-4 text-center" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">שגיאה בטעינת הטופס</h2>
          <p className="text-red-600 mb-4">אירעה שגיאה בטעינת טופס המשימה</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            חזור
          </button>
        </div>
      </div>
    );
  }

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

  const getMinutesFromOption = (option: string): number => {
    switch (option) {
      case "5_minutes": return 5;
      case "1_hour": return 60;
      case "24_hours": return 1440;
      default: return 30;
    }
  };

  const onSubmit = async (data: TaskFormValues) => {
    console.log("Starting task submission with data:", data);
    setIsSubmitting(true);
    
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

      console.log("Submitting task data:", taskData);

      if (!addTask) {
        throw new Error("addTask function not available");
      }

      const newTask = await addTask.mutateAsync(taskData);
      console.log("Task created successfully:", newTask);
      
      // Create notifications if requested and due date is set
      if (shouldCreateNotification && data.due_date && newTask && selectedNotificationOptions.length > 0 && scheduleNotification) {
        console.log("Creating notifications for task:", newTask.id || 'unknown');
        for (const option of selectedNotificationOptions) {
          const minutesBefore = getMinutesFromOption(option);
          const reminderTime = new Date(data.due_date.getTime() - minutesBefore * 60 * 1000);
          
          try {
            await scheduleNotification(
              `תזכורת למשימה: ${data.title}`,
              `המשימה מתחילה בעוד ${option === "5_minutes" ? "5 דקות" : option === "1_hour" ? "שעה" : "24 שעות"}`,
              reminderTime,
              data.type,
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

  const watchedDueDate = form.watch("due_date");

  try {
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
                label="צור תזכורות למשימה"
                disabled={permission !== "granted"}
                showOptions={true}
                selectedOptions={selectedNotificationOptions}
                onOptionsChange={setSelectedNotificationOptions}
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
  } catch (renderError) {
    console.error('Error rendering TaskForm:', renderError);
    return (
      <div className="p-4 text-center" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">שגיאה בהצגת הטופס</h2>
          <p className="text-red-600 mb-4">אירעה שגיאה בהצגת טופס המשימה</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            חזור
          </button>
        </div>
      </div>
    );
  }
}
