
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CarFormValues } from "../car-form-schema";

interface StepBasicInfoProps {
  form: UseFormReturn<CarFormValues>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
  // Fetch customers for the owner field
  const { data: customers } = useQuery({
    queryKey: ["customers-for-car-owner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, phone")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="owner_customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>בעלים</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="בחר לקוח קיים (אופציונלי)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent align="end" className="text-right max-h-60">
                  <SelectItem value="none" className="justify-end text-right">ללא בעלים</SelectItem>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id} className="justify-end text-right">
                      {customer.full_name} {customer.phone ? `(${customer.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entry_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תאריך כניסה</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מספר רישוי</FormLabel>
              <FormControl>
                <Input placeholder="123-45-678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="car_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סוג עסקה</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || "regular"}
                  className="flex gap-6 pt-2"
                  dir="rtl"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="regular" id="car-type-regular" />
                    <Label htmlFor="car-type-regular" className="cursor-pointer">רגיל</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="brokerage" id="car-type-brokerage" />
                    <Label htmlFor="car-type-brokerage" className="cursor-pointer">בתיווך</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
