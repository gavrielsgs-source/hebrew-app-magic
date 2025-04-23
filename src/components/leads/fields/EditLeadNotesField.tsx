
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function EditLeadNotesField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>הערות</FormLabel>
          <FormControl>
            <Textarea placeholder="הערות נוספות..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
