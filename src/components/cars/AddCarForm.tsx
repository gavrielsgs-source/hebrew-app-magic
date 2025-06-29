
import { useCars } from "@/hooks/use-cars";
import { toast } from "sonner";
import { CarFormValues } from "./car-form-schema";
import { CarFormBase } from "./CarFormBase";
import { useAuthContext } from "@/contexts/auth-context";
import { useSubscription } from "@/contexts/subscription-context";
import { SubscriptionLimitAlert } from "@/components/subscription/SubscriptionLimitAlert";
import { useState, useEffect } from "react";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/hooks/use-tasks";

interface AddCarFormProps {
  onSuccess?: () => void;
}

export function AddCarForm({ onSuccess }: AddCarFormProps = {}) {
  const { addCar, getCars } = useCars();
  const { agencies } = useAuthContext();
  const { subscription } = useSubscription();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const { addTask } = useTasks();
  const navigate = useNavigate();
  const [carCount, setCarCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current number of cars to check against limit
  useEffect(() => {
    const fetchCarsCount = async () => {
      try {
        const { data } = await getCars.refetch();
        setCarCount(data?.length || 0);
      } catch (error) {
        console.error("Error fetching cars count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarsCount();
  }, [getCars]);

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
    // New fields
    entry_date: "",
    license_number: "",
    chassis_number: "",
    next_test_date: "",
  };

  const onSubmit = async (values: CarFormValues, images: File[]) => {
    try {
      // בדיקת מגבלות מנוי לפני הוספת רכב חדש
      const canProceed = checkAndNotifyLimit('car', carCount, undefined, () => navigate('/subscription/upgrade'));
      
      if (!canProceed) {
        return;
      }

      if (images.length === 0) {
        const confirmed = window.confirm("לא נבחרו תמונות לרכב. האם ברצונך להמשיך בכל זאת?");
        if (!confirmed) return;
      }

      const newCar = await addCar.mutateAsync({
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
        images,
        // New fields
        entry_date: values.entry_date || null,
        license_number: values.license_number || null,
        chassis_number: values.chassis_number || null,
        next_test_date: values.next_test_date || null,
      });

      // Create task for next test date if provided
      if (values.next_test_date && newCar) {
        try {
          await addTask.mutateAsync({
            title: `טסט לרכב ${values.make} ${values.model}`,
            description: `תאריך טסט לרכב ${values.make} ${values.model} (${values.year}) - מספר רישוי: ${values.license_number || 'לא צוין'}`,
            due_date: new Date(values.next_test_date).toISOString(),
            type: 'test',
            priority: 'high',
            status: 'pending',
            car_id: newCar.id,
            assigned_to: null,
            agency_id: values.agency_id || null,
          });
          console.log("AddCarForm - Test task created successfully");
        } catch (taskError) {
          console.error("AddCarForm - Error creating test task:", taskError);
        }
      }

      // Update car count after successful addition
      setCarCount(prevCount => prevCount + 1);
      
      if (onSuccess) onSuccess();
      
      toast.success("הרכב נוסף בהצלחה");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("אירעה שגיאה בהוספת הרכב");
    }
  };

  return (
    <>
      {!isLoading && (
        <SubscriptionLimitAlert 
          featureKey="carLimit" 
          currentCount={carCount} 
          entityName="רכבים" 
        />
      )}
      <CarFormBase
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isSubmitting={addCar.isPending || isLoading}
        submitLabel="הוסף רכב"
      />
    </>
  );
}
