
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCars } from "@/hooks/use-cars";

const formSchema = z.object({
  make: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  model: z.string().min(1, "שדה חובה"),
  year: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד")
    .refine(val => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 1;
    }, "שנה לא תקינה"),
  kilometers: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד"),
  price: z.string()
    .regex(/^\d+$/, "יש להזין מספרים בלבד"),
});

export function AddCarForm() {
  const { addCar } = useCars();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      kilometers: "",
      price: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addCar.mutateAsync({
      make: values.make,
      model: values.model,
      year: parseInt(values.year),
      kilometers: parseInt(values.kilometers),
      price: parseInt(values.price),
      status: "available",
      description: "",
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>יצרן</FormLabel>
              <FormControl>
                <Input placeholder="טויוטה" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>דגם</FormLabel>
              <FormControl>
                <Input placeholder="קורולה" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שנה</FormLabel>
              <FormControl>
                <Input placeholder="2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="kilometers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>קילומטראז'</FormLabel>
              <FormControl>
                <Input placeholder="15000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מחיר</FormLabel>
              <FormControl>
                <Input placeholder="150000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={addCar.isPending}>
          {addCar.isPending ? "מוסיף..." : "הוסף רכב"}
        </Button>
      </form>
    </Form>
  );
}
