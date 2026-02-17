
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CarFormValues } from "../car-form-schema";

interface StepAdditionalInfoProps {
  form: UseFormReturn<CarFormValues>;
}

export function StepAdditionalInfo({ form }: StepAdditionalInfoProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="show_in_catalog"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
            <FormControl>
              <Switch
                checked={field.value === "true" || field.value === true}
                onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
              />
            </FormControl>
            <div className="!mt-0">
              <Label className="cursor-pointer font-medium">הצג בקטלוג החיצוני</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                כשמסומן, הרכב יופיע בקטלוג הציבורי שלך ללקוחות
              </p>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="model_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>קוד דגם</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dealer_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מחיר לסוחר</FormLabel>
              <FormControl>
                <Input placeholder="0" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="catalog_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>מחיר בקטלוג החיצוני</FormLabel>
            <FormControl>
              <Input placeholder="0" type="text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>הערות</FormLabel>
            <FormControl>
              <Textarea placeholder="הערות נוספות על הרכב..." rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
