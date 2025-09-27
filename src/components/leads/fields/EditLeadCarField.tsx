
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { CarSearchSelect } from "@/components/cars/CarSearchSelect";

type Props = {
  control: Control<any>;
};

export function EditLeadCarField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="car_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>רכב (אופציונלי)</FormLabel>
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
  );
}
