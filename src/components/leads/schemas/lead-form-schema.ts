
import * as z from "zod";
import { validateEmail, validatePhone, sanitizeInput } from "@/lib/security-utils";

export const leadFormSchema = z.object({
  name: z.string()
    .min(1, "שם הוא שדה חובה")
    .max(100, "שם ארוך מדי")
    .transform(sanitizeInput)
    .refine((val) => val.trim().length > 0, "שם לא יכול להכיל רק רווחים"),
  email: z.string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val) return true;
      const { isValid } = validateEmail(val);
      return isValid;
    }, "כתובת אימייל לא תקינה"),
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const { isValid } = validatePhone(val);
      return isValid;
    }, "מספר טלפון לא תקין"),
  notes: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  // UUID fields - allow empty string (will be converted to null) or valid UUID
  car_id: z.string().optional().or(z.literal("")).refine(
    (val) => val === "" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
    "נא לבחור רכב תקין"
  ),
  source: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  assigned_to: z.string().optional().or(z.literal("")).refine(
    (val) => val === "" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
    "נא לבחור משתמש תקין"
  ),
  status: z.string().optional()
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
