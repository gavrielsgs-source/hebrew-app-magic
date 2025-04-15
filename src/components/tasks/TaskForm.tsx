
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useTasks } from "@/hooks/use-tasks";
import { TaskBasicDetails } from "./form/TaskBasicDetails";
import { TaskTypeAndPriority } from "./form/TaskTypeAndPriority";
import { TaskDateAndStatus } from "./form/TaskDateAndStatus";
import { TaskRelations } from "./form/TaskRelations";
import { taskFormSchema, type TaskFormValues } from "@/types/task";

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addTask } = useTasks();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      type: "task",
      car_id: "",
      lead_id: "",
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const formattedValues = {
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        status: values.status,
        type: values.type,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        car_id: values.car_id || null,
        lead_id: values.lead_id || null,
      };

      await addTask.mutateAsync(formattedValues);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <TaskBasicDetails />
        <TaskTypeAndPriority />
        <TaskDateAndStatus />
        <TaskRelations />
        
        <Button type="submit" className="w-full" disabled={addTask.isPending}>
          {addTask.isPending ? "מוסיף..." : "הוסף משימה"}
        </Button>
      </form>
    </Form>
  );
}
