
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function AddLeadPhoneField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>טלפון</FormLabel>
          <FormControl>
            <Input placeholder="050-0000000" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
