
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarFormValues } from "../car-form-schema";

interface StepVehicleDetailsProps {
  form: UseFormReturn<CarFormValues>;
}

export function StepVehicleDetails({ form }: StepVehicleDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>יצרן *</FormLabel>
              <FormControl>
                <Input placeholder="טויוטה" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>דגם *</FormLabel>
              <FormControl>
                <Input placeholder="קורולה" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trim_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>רמת גימור</FormLabel>
              <FormControl>
                <Input placeholder="Elegance / Comfort" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שנה *</FormLabel>
              <FormControl>
                <Input placeholder="2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transmission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תיבת הילוכים</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent align="end" className="text-right">
                  <SelectItem value="manual" className="justify-end text-right">ידני</SelectItem>
                  <SelectItem value="automatic" className="justify-end text-right">אוטומט</SelectItem>
                  <SelectItem value="robotics" className="justify-end text-right">רובוטי</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fuel_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סוג דלק</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent align="end" className="text-right">
                  <SelectItem value="gasoline" className="justify-end text-right">בנזין</SelectItem>
                  <SelectItem value="diesel" className="justify-end text-right">דיזל</SelectItem>
                  <SelectItem value="hybrid" className="justify-end text-right">היברידי</SelectItem>
                  <SelectItem value="electric" className="justify-end text-right">חשמלי</SelectItem>
                  <SelectItem value="plugin_hybrid" className="justify-end text-right">פלאג אין</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="engine_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>נפח מנוע</FormLabel>
              <FormControl>
                <Input placeholder="1600" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="origin_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מקוריות</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="בחר" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent align="end" className="text-right">
                  <SelectItem value="private" className="justify-end text-right">פרטי</SelectItem>
                  <SelectItem value="leasing" className="justify-end text-right">ליסינג</SelectItem>
                  <SelectItem value="rental" className="justify-end text-right">השכרה</SelectItem>
                  <SelectItem value="company" className="justify-end text-right">חברה</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ownership_history"
          render={({ field }) => (
            <FormItem>
              <FormLabel>יד</FormLabel>
              <FormControl>
                <Input placeholder="יד ראשונה" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="kilometers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>קילומטראז' *</FormLabel>
              <FormControl>
                <Input placeholder="15000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="exterior_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>צבע חיצוני</FormLabel>
              <FormControl>
                <Input placeholder="לבן" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interior_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>צבע פנימי</FormLabel>
              <FormControl>
                <Input placeholder="שחור" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="next_test_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תאריך טסט</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chassis_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מספר שלדה</FormLabel>
              <FormControl>
                <Input placeholder="VIN123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="engine_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מספר מנוע</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
