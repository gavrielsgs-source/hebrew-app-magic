
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

  const onSubmit = async (values: CarFormValues, images: File[]) => {
    console.log("EditCarForm - Starting submission with values:", values);
    console.log("EditCarForm - Images provided:", images?.length || 0);
    
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
        images
      };

      console.log("EditCarForm - Calling updateCar.mutateAsync with:", updateData);
      await updateCar.mutateAsync(updateData);
      
      console.log("EditCarForm - Update successful, showing success message");
      toast.success("הרכב עודכן בהצלחה");
      onCancel();
    } catch (error) {
      console.error("EditCarForm - Error updating car:", error);
      toast.error("אירעה שגיאה בעדכון הרכב");
    }
  };

  return (
    <CarFormBase
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isSubmitting={updateCar.isPending}
      submitLabel="שמור שינויים"
      onCancel={onCancel}
    />
  );
}
