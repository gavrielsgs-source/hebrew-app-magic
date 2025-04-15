
import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  description: z.string().optional().or(z.literal("")),
  priority: z.string(),
  status: z.string(),
  type: z.string(),
  due_date: z.date().optional(),
  car_id: z.string().uuid("נא לבחור רכב").optional().or(z.literal("")),
  lead_id: z.string().uuid("נא לבחור ליד").optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
