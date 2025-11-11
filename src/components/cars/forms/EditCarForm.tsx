
import { useState } from "react";
import { toast } from "sonner";
import { Car } from "@/types/car";
import { CarFormValues } from "../car-form-schema";
import { CarFormBase } from "../CarFormBase";
import { useUpdateCar } from "@/hooks/cars/use-update-car";
import { useAuthContext } from "@/contexts/auth-context";
import { createDefaultFormValues } from "./CarFormValues";
import { useTasks } from "@/hooks/use-tasks";

interface EditCarFormProps {
  car: Car;
  onCancel: () => void;
}

export function EditCarForm({ car, onCancel }: EditCarFormProps) {
  const updateCar = useUpdateCar();
  const { agencies } = useAuthContext();
  const { addTask } = useTasks();
  const defaultValues = createDefaultFormValues(car);

  console.log("EditCarForm - Rendering with car:", car.id);
  console.log("EditCarForm - updateCar.isPending:", updateCar.isPending);

  const onSubmit = async (values: CarFormValues, images: File[]) => {
    console.log("EditCarForm - onSubmit called with values:", values);
    console.log("EditCarForm - Images provided:", images?.length || 0);
    console.log("EditCarForm - Current isPending state:", updateCar.isPending);
    
    if (updateCar.isPending) {
      console.log("EditCarForm - Already submitting, ignoring request");
      return;
    }
    
    try {
      console.log("EditCarForm - Preparing update data...");
      
      const updateData = {
        id: car.id,
        make: values.make,
        model: values.model,
        trim_level: values.trim_level || null,
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
        images: images && images.length > 0 ? images : undefined,
        // New fields
        entry_date: values.entry_date || null,
        license_number: values.license_number || null,
        chassis_number: values.chassis_number || null,
        next_test_date: values.next_test_date || null,
        purchase_cost: values.purchase_cost ? parseFloat(values.purchase_cost as string) : null,
        purchase_date: values.purchase_date || null,
        supplier_name: values.supplier_name || null,
      };

      console.log("EditCarForm - About to call updateCar.mutateAsync with data:", updateData);
      
      const result = await updateCar.mutateAsync(updateData);
      
      // Create task for next test date if provided and different from previous
      if (values.next_test_date && values.next_test_date !== car.next_test_date) {
        try {
          await addTask.mutateAsync({
            title: `טסט לרכב ${car.make} ${car.model}`,
            description: `תאריך טסט לרכב ${car.make} ${car.model} (${car.year}) - מספר רישוי: ${values.license_number || 'לא צוין'}`,
            due_date: new Date(values.next_test_date).toISOString(),
            type: 'test',
            priority: 'high',
            status: 'pending',
            car_id: car.id,
            assigned_to: null,
            agency_id: values.agency_id || null,
          });
          console.log("EditCarForm - Test task created successfully");
        } catch (taskError) {
          console.error("EditCarForm - Error creating test task:", taskError);
        }
      }
      
      console.log("EditCarForm - Update successful, result:", result);
      toast.success("הרכב עודכן בהצלחה");
      
      console.log("EditCarForm - Calling onCancel to close form");
      onCancel();
      
    } catch (error) {
      console.error("EditCarForm - Error updating car:", error);
      
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
      
      throw error;
    }
  };

  console.log("EditCarForm - About to render CarFormBase with props:", {
    submitLabel: "שמור שינויים",
    isSubmitting: updateCar.isPending,
    hasOnCancel: !!onCancel
  });

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
