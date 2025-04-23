
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function AddLeadNameField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>שם</FormLabel>
          <FormControl>
            <Input placeholder="ישראל ישראלי" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
