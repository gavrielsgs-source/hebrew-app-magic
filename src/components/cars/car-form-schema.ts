
import * as z from "zod";
import { sanitizeInput } from "@/lib/security-utils";

export const carFormSchema = z.object({
  make: z.string()
    .min(2, "נדרשות לפחות 2 אותיות")
    .max(50, "יותר מדי תווים")
    .transform(sanitizeInput),
  model: z.string()
    .min(1, "שדה חובה")
    .max(50, "יותר מדי תווים")
    .transform(sanitizeInput),
  year: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד")
    .refine(val => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 1;
    }, "שנה לא תקינה"),
  kilometers: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד"),
  price: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד"),
  description: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  interior_color: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  exterior_color: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  transmission: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  fuel_type: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  engine_size: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  registration_year: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד")
    .optional()
    .or(z.literal("")), // Allow empty string
  last_test_date: z.string().optional().or(z.literal("")), // Allow empty string
  ownership_history: z.string().optional().or(z.literal("")), // Allow empty string
  agency_id: z.string().optional().nullable().or(z.literal("")), // Allow null, empty string, or undefined
  // New fields
  entry_date: z.string().optional().or(z.literal("")), // Allow empty string
  license_number: z.string().optional().or(z.literal("")), // Allow empty string
  chassis_number: z.string().optional().or(z.literal("")), // Allow empty string
  next_test_date: z.string().optional().or(z.literal("")), // Allow empty string
});

export type CarFormValues = z.infer<typeof carFormSchema>;
