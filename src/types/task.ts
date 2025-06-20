
import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  description: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  type: z.enum(["task", "call", "meeting", "follow_up"]),
  due_date: z.date().optional(),
  car_id: z.string().uuid("נא לבחור רכב").optional().or(z.literal("")),
  lead_id: z.string().uuid("נא לבחור ליד").optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

// Define Task interface that matches what comes back from the database
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  car_id?: string | null;
  lead_id?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  type: string;
  cars?: {
    make?: string;
    model?: string;
  } | null;
  leads?: {
    name?: string;
  } | null;
}
