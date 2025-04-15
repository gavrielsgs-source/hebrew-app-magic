
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCars } from "@/hooks/use-cars";
import { ImageUploadInput } from "./ImageUploadInput";
import { carFormSchema, type CarFormValues } from "./car-form-schema";

interface AddCarFormProps {
  onSuccess?: () => void;
}

export function AddCarForm({ onSuccess }: AddCarFormProps = {}) {
  const { addCar } = useCars();
  const [images, setImages] = useState<File[]>([]);
  
  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      kilometers: "",
      price: "",
      description: "",
      interior_color: "",
      exterior_color: "",
      transmission: "",
      fuel_type: "",
      engine_size: "",
      registration_year: "",
      last_test_date: "",
      ownership_history: "",
    },
  });

  const onSubmit = async (values: CarFormValues) => {
    await addCar.mutateAsync({
      make: values.make,
      model: values.model,
      year: parseInt(values.year),
      kilometers: parseInt(values.kilometers),
      price: parseInt(values.price),
      registration_year: values.registration_year ? parseInt(values.registration_year) : null,
      description: values.description || "",
      interior_color: values.interior_color || null,
      exterior_color: values.exterior_color || null,
      transmission: values.transmission || null,
      fuel_type: values.fuel_type || null,
      engine_size: values.engine_size || null,
      last_test_date: values.last_test_date || null,
      ownership_history: values.ownership_history || null,
      status: "available",
      images
    });
    form.reset();
    setImages([]);
    if (onSuccess) onSuccess();
  };

  const handleImageChange = (files: FileList | null) => {
    if (files) {
      setImages(Array.from(files));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-4">
          <FormItem>
            <FormLabel>תמונות הרכב</FormLabel>
            <FormControl>
              <ImageUploadInput onChange={handleImageChange} value={images} />
            </FormControl>
            <FormDescription>
              ניתן להעלות מספר תמונות של הרכב
            </FormDescription>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <FormField
            control={form.control}
            name="ownership_history"
            render={({ field }) => (
              <FormItem>
                <FormLabel>יד</FormLabel>
                <FormControl>
                  <Input placeholder="יד ראשונה" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interior_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>צבע פנימי</FormLabel>
                <FormControl>
                  <Input placeholder="שחור" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exterior_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>צבע חיצוני</FormLabel>
                <FormControl>
                  <Input placeholder="לבן" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>תיבת הילוכים</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תיבת הילוכים" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual">ידני</SelectItem>
                    <SelectItem value="automatic">אוטומט</SelectItem>
                    <SelectItem value="robotics">רובוטי</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fuel_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוג דלק</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג דלק" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gasoline">בנזין</SelectItem>
                    <SelectItem value="diesel">דיזל</SelectItem>
                    <SelectItem value="hybrid">היברידי</SelectItem>
                    <SelectItem value="electric">חשמלי</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="engine_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>נפח מנוע</FormLabel>
                <FormControl>
                  <Input placeholder="1600" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registration_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שנת רישוי</FormLabel>
                <FormControl>
                  <Input placeholder="2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_test_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>תאריך טסט אחרון</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תיאור כללי והערות</FormLabel>
              <FormControl>
                <Textarea placeholder="תיאור נוסף של הרכב..." {...field} />
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
