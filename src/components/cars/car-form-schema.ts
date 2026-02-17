
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
  trim_level: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
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
    .regex(/^[\d,]+$/, "יש להזין מספרים ופסיקים בלבד")
    .transform((val) => val.replace(/,/g, '')),
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
    .or(z.literal("")),
  last_test_date: z.string().optional().or(z.literal("")),
  ownership_history: z.string().optional().or(z.literal("")),
  agency_id: z.string().optional().nullable().or(z.literal("")),
  entry_date: z.string().optional().or(z.literal("")),
  license_number: z.string().optional().or(z.literal("")),
  chassis_number: z.string().optional().or(z.literal("")),
  next_test_date: z.string().optional().or(z.literal("")),
  // Purchase fields
  purchase_cost: z.string().optional().or(z.literal("")),
  purchase_date: z.string().optional().or(z.literal("")),
  supplier_name: z.string()
    .optional()
    .transform((val) => val ? sanitizeInput(val) : val),
  // New wizard fields
  car_type: z.string().optional().or(z.literal("")),
  owner_customer_id: z.string().optional().nullable().or(z.literal("")),
  origin_type: z.string().optional().or(z.literal("")),
  model_code: z.string().optional().or(z.literal("")),
  engine_number: z.string().optional().or(z.literal("")),
  vat_paid: z.string().optional().or(z.literal("")),
  minimum_price: z.string().optional().or(z.literal("")),
  list_price: z.string().optional().or(z.literal("")),
  registration_fee: z.string().optional().or(z.literal("")),
  is_pledged: z.any().optional(),
  show_in_catalog: z.any().optional(),
  dealer_price: z.string().optional().or(z.literal("")),
  catalog_price: z.string().optional().or(z.literal("")),
  asking_price: z.string().optional().or(z.literal("")),
});

export type CarFormValues = z.infer<typeof carFormSchema>;
