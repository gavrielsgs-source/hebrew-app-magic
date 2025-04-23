
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control } from "react-hook-form";

type Props = {
  control: Control<any>;
  salesAgents: Array<any>;
};

export function AddLeadAssignedField({ control, salesAgents }: Props) {
  return (
    <FormField
      control={control}
      name="assigned_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>הקצה לאיש מכירות</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוכן מכירות" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">לא משויך</SelectItem>
              {salesAgents.map((agent: any) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.email} {agent.full_name ? `(${agent.full_name})` : ''}
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
