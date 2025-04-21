
import { useCars } from "@/hooks/use-cars";
import { toast } from "sonner";
import { CarFormValues } from "./car-form-schema";
import { CarFormBase } from "./CarFormBase";
import { useAuthContext } from "@/contexts/auth-context";

interface AddCarFormProps {
  onSuccess?: () => void;
}

export function AddCarForm({ onSuccess }: AddCarFormProps = {}) {
  const { addCar } = useCars();
  const { agencies } = useAuthContext();

  const defaultValues: CarFormValues = {
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
    agency_id: agencies && agencies.length > 0 ? agencies[0]?.id : undefined,
  };

  const onSubmit = async (values: CarFormValues, images: File[]) => {
    try {
      if (images.length === 0) {
        const confirmed = window.confirm("לא נבחרו תמונות לרכב. האם ברצונך להמשיך בכל זאת?");
        if (!confirmed) return;
      }
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
        agency_id: values.agency_id,
        images
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("אירעה שגיאה בהוספת הרכב");
    }
  };

  return (
    <CarFormBase
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isSubmitting={addCar.isPending}
      submitLabel="הוסף רכב"
    />
  );
}
