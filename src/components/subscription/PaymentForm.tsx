
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const paymentFormSchema = z.object({
  fullName: z
    .string()
    .min(3, "יש להזין שם מלא")
    .refine((val) => val.includes(" "), {
      message: "יש להזין שם פרטי ושם משפחה",
    }),
  phone: z
    .string()
    .min(10, "מספר טלפון חייב להכיל 10 ספרות")
    .max(10, "מספר טלפון חייב להכיל 10 ספרות")
    .regex(/^05\d{8}$/, "מספר טלפון חייב להתחיל ב-05 ולהכיל 10 ספרות"),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  selectedPlan: string | null;
  initialValues?: Partial<PaymentFormValues>;
}

export function PaymentForm({
  onSubmit,
  loading,
  onCancel,
  selectedPlan,
  initialValues,
}: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      fullName: initialValues?.fullName || "",
      phone: initialValues?.phone || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם מלא</FormLabel>
              <FormControl>
                <Input placeholder="ישראל ישראלי" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>טלפון נייד</FormLabel>
              <FormControl>
                <Input placeholder="0501234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onCancel} disabled={loading} type="button">
            ביטול
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                מעבד...
              </span>
            ) : (
              <>המשך לתשלום</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
