
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const paymentFormSchema = z.object({
  fullName: z.string()
    .min(3, "יש להזין שם מלא")
    .refine(val => val.includes(' '), {
      message: "יש להזין שם פרטי ושם משפחה",
    }),
  phone: z.string()
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
  onMockSuccess: (planId: string) => void;
}

export function PaymentForm({ 
  onSubmit, 
  loading, 
  onCancel, 
  selectedPlan,
  onMockSuccess 
}: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      notes: "",
      userId: "", 
      transactionToken: "",
      transactionId: "",
      asmachta: "",
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
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אימייל (אופציונלי)</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Direct Debit Fields */}
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input placeholder="User ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="transactionToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Token</FormLabel>
              <FormControl>
                <Input placeholder="Transaction Token" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID</FormLabel>
              <FormControl>
                <Input placeholder="Transaction ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="asmachta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asmachta</FormLabel>
              <FormControl>
                <Input placeholder="Asmachta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>הערות (אופציונלי)</FormLabel>
              <FormControl>
                <Textarea placeholder="הערות נוספות לתשלום" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            ביטול
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
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
        
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-muted-foreground mb-2">למטרות פיתוח בלבד:</p>
          <Button 
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onMockSuccess(selectedPlan || 'premium')}
          >
            סימולציית תשלום מוצלח
          </Button>
        </div>
      </form>
    </Form>
  );
}
