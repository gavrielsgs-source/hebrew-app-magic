
import { toast } from "sonner";
import { Car } from "@/types/car";
import { CarFormValues } from "../car-form-schema";
import { CarFormWizard } from "../wizard/CarFormWizard";
import { useUpdateCar } from "@/hooks/cars/use-update-car";
import { createDefaultFormValues } from "./CarFormValues";
import { useTasks } from "@/hooks/use-tasks";

interface EditCarFormProps {
  car: Car;
  onCancel: () => void;
}

export function EditCarForm({ car, onCancel }: EditCarFormProps) {
  const updateCar = useUpdateCar();
  const { addTask } = useTasks();
  const defaultValues = createDefaultFormValues(car);

  const onSubmit = async (values: CarFormValues, images: File[]) => {
    if (updateCar.isPending) return;
    
    try {
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
        entry_date: values.entry_date || null,
        license_number: values.license_number || null,
        chassis_number: values.chassis_number || null,
        next_test_date: values.next_test_date || null,
        purchase_cost: values.purchase_cost ? parseFloat(values.purchase_cost as string) : null,
        purchase_date: values.purchase_date || null,
        supplier_name: values.supplier_name || null,
        // New wizard fields
        car_type: values.car_type || 'regular',
        owner_customer_id: values.owner_customer_id === "none" ? null : values.owner_customer_id || null,
        origin_type: values.origin_type || null,
        model_code: values.model_code || null,
        engine_number: values.engine_number || null,
        vat_paid: values.vat_paid ? parseFloat(values.vat_paid as string) : null,
        asking_price: values.asking_price ? parseFloat(values.asking_price as string) : null,
        minimum_price: values.minimum_price ? parseFloat(values.minimum_price as string) : null,
        list_price: values.list_price ? parseFloat(values.list_price as string) : null,
        registration_fee: values.registration_fee ? parseFloat(values.registration_fee as string) : null,
        is_pledged: values.is_pledged === "true" || values.is_pledged === true,
        show_in_catalog: values.show_in_catalog === "true" || values.show_in_catalog === true,
        dealer_price: values.dealer_price ? parseFloat(values.dealer_price as string) : null,
        catalog_price: values.catalog_price ? parseFloat(values.catalog_price as string) : null,
      };

      await updateCar.mutateAsync(updateData);
      
      // Create task for next test date if changed
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
        } catch (taskError) {
          console.error("Error creating test task:", taskError);
        }
      }
      
      toast.success("הרכב עודכן בהצלחה");
      onCancel();
    } catch (error) {
      console.error("Error updating car:", error);
      if (error instanceof Error) {
        toast.error(`שגיאה בעדכון הרכב: ${error.message}`);
      } else {
        toast.error("אירעה שגיאה בעדכון הרכב");
      }
      throw error;
    }
  };

  return (
    <div>
      <CarFormWizard
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isSubmitting={updateCar.isPending}
        submitLabel="שמור שינויים"
        onCancel={onCancel}
      />
    </div>
  );
}
