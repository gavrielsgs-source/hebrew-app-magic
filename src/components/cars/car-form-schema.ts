
import * as z from "zod";

export const carFormSchema = z.object({
  make: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  model: z.string().min(1, "שדה חובה"),
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
  description: z.string().optional(),
  interior_color: z.string().optional(),
  exterior_color: z.string().optional(),
  transmission: z.string().optional(),
  fuel_type: z.string().optional(),
  engine_size: z.string().optional(),
  registration_year: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד")
    .optional()
    .or(z.literal("")), // Allow empty string
  last_test_date: z.string().optional().or(z.literal("")), // Allow empty string
  ownership_history: z.string().optional().or(z.literal("")), // Allow empty string
  agency_id: z.string().optional().or(z.literal("")), // New field for agency_id
});

export type CarFormValues = z.infer<typeof carFormSchema>;
