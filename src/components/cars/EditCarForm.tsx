
import { CarFormValues } from "./car-form-schema";
import { Car } from "@/types/car";
import { CarFormBase } from "./CarFormBase";
import { useCars } from "@/hooks/use-cars";
import { useAuthContext } from "@/contexts/auth-context";
import { useState } from "react";
import { toast } from "sonner";

interface EditCarFormProps {
  car: Car;
  onCancel: () => void;
}

export function EditCarForm({ car, onCancel }: EditCarFormProps) {
  const { updateCar } = useCars();
  const { agencies } = useAuthContext();
  const [initialImages] = useState<File[]>([]);

  const defaultValues: CarFormValues = {
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
  };

  const onSubmit = async (values: CarFormValues, images: File[]) => {
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
