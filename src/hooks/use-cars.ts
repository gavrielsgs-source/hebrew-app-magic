
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Car, NewCar } from "@/types/car";

export function useCars() {
  const queryClient = useQueryClient();

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("שגיאה בטעינת רכבים");
        throw error;
      }

      return data;
    },
  });

  const addCar = useMutation({
    mutationFn: async (car: NewCar) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast.error("לא ניתן להוסיף רכב - משתמש לא מחובר");
        throw userError || new Error("User not authenticated");
      }

      // Make sure all required fields are included
      const { data, error } = await supabase
        .from("cars")
        .insert({
          make: car.make,
          model: car.model,
          year: car.year,
          kilometers: car.kilometers,
          price: car.price,
          description: car.description,
          interior_color: car.interior_color,
          exterior_color: car.exterior_color,
          transmission: car.transmission,
          fuel_type: car.fuel_type,
          engine_size: car.engine_size,
          registration_year: car.registration_year,
          last_test_date: car.last_test_date,
          ownership_history: car.ownership_history,
          status: car.status,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) {
        toast.error("שגיאה בהוספת רכב");
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("רכב נוסף בהצלחה");
    },
  });

  return {
    cars,
    isLoading,
    addCar,
  };
}
