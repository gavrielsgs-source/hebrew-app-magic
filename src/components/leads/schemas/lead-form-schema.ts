
import * as z from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  email: z.string().email("כתובת אימייל לא תקינה").optional().or(z.literal("")),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין"),
  notes: z.string().optional().or(z.literal("")),
  // UUID fields - allow empty string (will be converted to null) or valid UUID
  car_id: z.string().optional().or(z.literal("")).refine(
    (val) => val === "" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
    "נא לבחור רכב תקין"
  ),
  source: z.string().optional().or(z.literal("")),
  assigned_to: z.string().optional().or(z.literal("")).refine(
    (val) => val === "" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
    "נא לבחור משתמש תקין"
  ),
  status: z.string().optional()
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
