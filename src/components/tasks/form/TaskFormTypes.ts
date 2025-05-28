
import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "כותרת המשימה חובה"),
  description: z.string().optional(),
  due_date: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  type: z.enum(["call", "meeting", "follow_up", "task"]).default("task"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  lead_id: z.string().optional(),
  car_id: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export interface TaskFormProps {
  onSuccess?: () => void;
  initialLeadId?: string;
  initialCarId?: string;
}
