
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { useCars } from "@/hooks/use-cars";
import { useLeads } from "@/hooks/use-leads";
import type { TaskFormValues } from "@/types/task";

export function TaskRelations() {
  const { cars } = useCars();
  const { leads } = useLeads();
  const form = useFormContext<TaskFormValues>();

  return (
    <>
      <FormField
        control={form.control}
        name="car_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>רכב קשור (אופציונלי)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="בחר רכב" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">ללא רכב</SelectItem>
                {cars?.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.make} {car.model} ({car.year})
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
        name="lead_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ליד קשור (אופציונלי)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="בחר ליד" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">ללא ליד</SelectItem>
                {leads?.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} - {lead.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
