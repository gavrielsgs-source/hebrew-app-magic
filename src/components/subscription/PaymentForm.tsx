import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const paymentFormSchema = z.object({
  fullName: z
    .string()
    .min(3, "יש להזין שם מלא")
    .refine((val) => val.includes(" "), {
      message: "יש להזין שם פרטי ושם משפחה",
    }),
  email: z.string().min(3, "יש להזין אימייל").email("יש להזין אימייל"),
  phone: z
    .string()
    .min(10, "מספר טלפון חייב להכיל 10 ספרות")
    .max(10, "מספר טלפון חייב להכיל 10 ספרות")
    .regex(/^05\d{8}$/, "מספר טלפון חייב להתחיל ב-05 ולהכיל 10 ספרות"),
  companyName: z.string().min(2, "יש להזין שם חברה"),
  businessId: z.string().min(5, "יש להזין ח.פ או ע.מ תקין"),
  address: z.string().min(5, "יש להזין כתובת מלאה"),
  city: z.string().min(2, "יש להזין עיר"),
  postalCode: z.string().regex(/^\d{5,7}$/, "מיקוד חייב להכיל 5-7 ספרות"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "חובה לאשר את תנאי השימוש ומדיניות הפרטיות",
  }),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  selectedPlan: string | null;
  initialValues?: Partial<PaymentFormValues>;
}

export function PaymentForm({ onSubmit, loading, onCancel, selectedPlan, initialValues }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      fullName: initialValues?.fullName || "",
      phone: initialValues?.phone || "",
      email: initialValues?.email || "",
      companyName: initialValues?.companyName || "",
      businessId: initialValues?.businessId || "",
      address: initialValues?.address || "",
      city: initialValues?.city || "",
      postalCode: initialValues?.postalCode || "",
      acceptTerms: false,
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אימייל</FormLabel>
              <FormControl>
                <Input placeholder="email@gmail.com" {...field} />
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

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם החברה</FormLabel>
              <FormControl>
                <Input placeholder="שם החברה" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ח.פ / ע.מ</FormLabel>
              <FormControl>
                <Input placeholder="מספר עוסק מורשה או ח.פ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>כתובת</FormLabel>
              <FormControl>
                <Input placeholder="רחוב ומספר בית" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>עיר</FormLabel>
                <FormControl>
                  <Input placeholder="תל אביב" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מיקוד</FormLabel>
                <FormControl>
                  <Input placeholder="1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none mr-2">
                <FormLabel>
                  אני מאשר/ת את{" "}
                  <Link to="/terms-of-service" target="_blank" className="text-primary underline hover:text-primary/80">
                    תנאי השימוש
                  </Link>{" "}
                  ואת{" "}
                  <Link to="/privacy-policy" target="_blank" className="text-primary underline hover:text-primary/80">
                    מדיניות הפרטיות
                  </Link>
                </FormLabel>
                <FormMessage />
              </div>
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
