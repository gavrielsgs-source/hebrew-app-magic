
import { useState } from "react";
import { toast } from "sonner";
import { Car } from "@/types/car";
import { CarFormValues } from "../car-form-schema";
import { CarFormBase } from "../CarFormBase";
import { useUpdateCar } from "@/hooks/cars/use-update-car";
import { useAuthContext } from "@/contexts/auth-context";
import { createDefaultFormValues } from "./CarFormValues";

interface EditCarFormProps {
  car: Car;
  onCancel: () => void;
}

export function EditCarForm({ car, onCancel }: EditCarFormProps) {
  const updateCar = useUpdateCar();
  const { agencies } = useAuthContext();
  const [initialImages] = useState<File[]>([]);
  const defaultValues = createDefaultFormValues(car);

  console.log("EditCarForm - Rendering with car:", car.id);
  console.log("EditCarForm - updateCar.isPending:", updateCar.isPending);

  const onSubmit = async (values: CarFormValues, images: File[]) => {
    console.log("EditCarForm - onSubmit called with values:", values);
    console.log("EditCarForm - Images provided:", images?.length || 0);
    
    if (updateCar.isPending) {
      console.log("EditCarForm - Already submitting, ignoring request");
      return;
    }
    
    try {
      const updateData = {
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
        agency_id: values.agency_id || null,
        images: images && images.length > 0 ? images : undefined // Only include images if they exist
      };

      console.log("EditCarForm - About to call updateCar.mutateAsync");
      await updateCar.mutateAsync(updateData);
      
      console.log("EditCarForm - Update successful");
      toast.success("הרכב עודכן בהצלחה");
      onCancel();
    } catch (error) {
      console.error("EditCarForm - Error updating car:", error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('auth')) {
          toast.error("שגיאת הזדהות - אנא התחבר מחדש");
        } else if (error.message.includes('network')) {
          toast.error("שגיאת רשת - בדוק את החיבור לאינטרנט");
        } else {
          toast.error(`שגיאה בעדכון הרכב: ${error.message}`);
        }
      } else {
        toast.error("אירעה שגיאה בעדכון הרכב");
      }
    }
  };

  return (
    <div>
      <CarFormBase
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isSubmitting={updateCar.isPending}
        submitLabel="שמור שינויים"
        onCancel={onCancel}
      />
    </div>
  );
}
