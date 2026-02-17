
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CarFormValues } from "../car-form-schema";
import { useEffect } from "react";

interface StepFinancialInfoProps {
  form: UseFormReturn<CarFormValues>;
}

const VAT_RATE = 0.18;

export function StepFinancialInfo({ form }: StepFinancialInfoProps) {
  const formValues = form.watch();
  const includeVat = formValues.include_vat;
  const purchaseCost = formValues.purchase_cost;

  // Auto-calculate VAT when toggle is on or purchase cost changes
  useEffect(() => {
    if (includeVat === true || includeVat === "true") {
      const cost = parseFloat((purchaseCost || "0").toString().replace(/,/g, ''));
      if (!isNaN(cost) && cost > 0) {
        const vat = Math.round(cost * VAT_RATE);
        form.setValue("vat_paid", vat.toString());
      }
    }
  }, [includeVat, purchaseCost, form]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="purchase_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מחיר קניה</FormLabel>
              <FormControl>
                <Input placeholder="0" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="vat_paid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מע"מ ששולם</FormLabel>
                <div className="flex gap-2 items-center">
                  <FormControl>
                    <Input 
                      placeholder="0" 
                      type="text" 
                      {...field} 
                      disabled={includeVat === true || includeVat === "true"}
                    />
                  </FormControl>
                  <FormField
                    control={form.control}
                    name="include_vat"
                    render={({ field: vatField }) => (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Switch
                          checked={vatField.value === true || vatField.value === "true"}
                          onCheckedChange={(checked) => {
                            vatField.onChange(checked);
                            if (!checked) {
                              form.setValue("vat_paid", "");
                            }
                          }}
                        />
                        <Label className="text-xs cursor-pointer !mt-0">18%</Label>
                      </div>
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מחיר דרישה *</FormLabel>
              <FormControl>
                <Input placeholder="150000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="minimum_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מחיר מינימלי</FormLabel>
              <FormControl>
                <Input placeholder="0" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="list_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מחיר מחירון</FormLabel>
              <FormControl>
                <Input placeholder="0" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="registration_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סכום אגרת רישוי</FormLabel>
              <FormControl>
                <Input placeholder="0" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_pledged"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 pt-8">
              <FormControl>
                <Switch
                  checked={field.value === true || field.value === "true"}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </FormControl>
              <Label className="cursor-pointer !mt-0">רכב משועבד</Label>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
