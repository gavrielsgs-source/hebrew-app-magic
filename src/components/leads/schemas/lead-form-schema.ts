
import * as z from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  email: z.string().email("כתובת אימייל לא תקינה").optional().or(z.literal("")),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין"),
  notes: z.string().optional().or(z.literal("")),
  car_id: z.string().uuid("נא לבחור רכב").optional().or(z.literal("")),
  source: z.string().optional(),
  assigned_to: z.string().optional().or(z.literal("")),
  status: z.string().optional()
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
