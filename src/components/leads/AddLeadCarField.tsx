
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control } from "react-hook-form";

type Props = {
  control: Control<any>;
  cars: Array<any>;
};

export function AddLeadCarField({ control, cars }: Props) {
  return (
    <FormField
      control={control}
      name="car_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>רכב (אופציונלי)</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="בחר רכב" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {cars?.map((car: any) => (
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
  );
}
