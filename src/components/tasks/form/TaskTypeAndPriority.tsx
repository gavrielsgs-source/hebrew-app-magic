
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import type { TaskFormValues } from "@/types/task";

export function TaskTypeAndPriority() {
  const form = useFormContext<TaskFormValues>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>סוג</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="task">משימה</SelectItem>
                <SelectItem value="call">שיחת טלפון</SelectItem>
                <SelectItem value="meeting">פגישה</SelectItem>
                <SelectItem value="follow_up">מעקב</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>עדיפות</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עדיפות" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">נמוכה</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="high">גבוהה</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
