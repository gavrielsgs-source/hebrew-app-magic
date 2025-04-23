
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function EditLeadEmailField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>אימייל</FormLabel>
          <FormControl>
            <Input placeholder="israel@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
