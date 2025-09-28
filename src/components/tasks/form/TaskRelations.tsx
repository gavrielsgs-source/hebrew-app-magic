
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { useLeads } from "@/hooks/use-leads";
import { CarSearchSelect } from "@/components/cars/CarSearchSelect";
import type { TaskFormValues } from "@/types/task";

export function TaskRelations() {
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
            <CarSearchSelect
              value={field.value}
              onValueChange={field.onChange}
              placeholder="בחר רכב"
              includeNoneOption={true}
            />
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
                <SelectTrigger className="text-right [&>span]:w-full [&>span]:text-right">
                  <SelectValue placeholder="בחר ליד" />
                </SelectTrigger>
              </FormControl>
              <SelectContent 
                dir="rtl" 
                side="bottom" 
                align="end" 
                avoidCollisions={false} 
                sideOffset={6}
                className="z-50 min-w-[var(--radix-select-trigger-width)] bg-background"
              >
                <SelectItem value="none" className="text-center">
                  ללא שיוך לליד
                </SelectItem>
                {leads?.map((lead) => (
                  <SelectItem key={lead.id as string} value={lead.id as string} className="text-center">
                    <div className="flex flex-col text-center w-full items-center">
                      <span className="font-medium">
                        {lead.name as string}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {lead.phone as string}
                      </span>
                    </div>
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
