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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadInput } from "./ImageUploadInput";
import { carFormSchema, type CarFormValues } from "./car-form-schema";
import { Car } from "@/types/car";
import { useCars } from "@/hooks/use-cars";
import { useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";

interface EditCarFormProps {
  car: Car;
  onCancel: () => void;
}

export function EditCarForm({ car, onCancel }: EditCarFormProps) {
  const { updateCar } = useCars();
  const [images, setImages] = useState<File[]>([]);
  const { agencies, isAdmin, hasRole } = useAuthContext();
  const canSelectAgency = isAdmin || hasRole('agency_manager');

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: car.make,
      model: car.model,
      year: car.year.toString(),
      kilometers: car.kilometers.toString(),
      price: car.price.toString(),
      description: car.description || "",
      interior_color: car.interior_color || "",
      exterior_color: car.exterior_color || "",
      transmission: car.transmission || "",
      fuel_type: car.fuel_type || "",
      engine_size: car.engine_size || "",
      registration_year: car.registration_year?.toString() || "",
      last_test_date: car.last_test_date || "",
      ownership_history: car.ownership_history || "",
      agency_id: car.agency_id || (agencies && agencies.length > 0 ? agencies[0]?.id : undefined),
    },
  });

  const onSubmit = async (values: CarFormValues) => {
    try {
      await updateCar.mutateAsync({
        id: car.id,
        make: values.make,
        model: values.model,
        year: parseInt(values.year),
        kilometers: parseInt(values.kilometers),
        price: parseInt(values.price),
        description: values.description || null,
        interior_color: values.interior_color || null,
        exterior_color: values.exterior_color || null,
        transmission: values.transmission || null,
        fuel_type: values.fuel_type || null,
        engine_size: values.engine_size || null,
        registration_year: values.registration_year ? parseInt(values.registration_year) : null,
        last_test_date: values.last_test_date || null,
        ownership_history: values.ownership_history || null,
        status: car.status,
        agency_id: values.agency_id,
        images
      });
      onCancel();
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {canSelectAgency && agencies && agencies.length > 0 && (
          <FormField
            control={form.control}
            name="agency_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוכנות</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוכנות" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <FormItem>
            <FormLabel>תמונות הרכב</FormLabel>
            <FormControl>
              <ImageUploadInput onChange={(files) => setImages(files ? Array.from(files) : [])} />
            </FormControl>
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            ביטול
          </Button>
          <Button type="submit" disabled={updateCar.isPending}>
            {updateCar.isPending ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
