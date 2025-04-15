
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import type { TaskFormValues } from "@/types/task";

export function TaskBasicDetails() {
  const form = useFormContext<TaskFormValues>();

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>כותרת</FormLabel>
            <FormControl>
              <Input placeholder="שיחת טלפון עם לקוח" {...field} />
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
            <FormLabel>תיאור</FormLabel>
            <FormControl>
              <Textarea placeholder="פרטים נוספים..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
