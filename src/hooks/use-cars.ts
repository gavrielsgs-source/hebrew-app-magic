
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
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          toast.error("לא ניתן להוסיף רכב - משתמש לא מחובר");
          throw userError || new Error("User not authenticated");
        }

        // First insert the car data
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

        // If we have images, upload them
        if (car.images && car.images.length > 0 && data.id) {
          const carId = data.id;
          
          // Upload each image
          const uploadPromises = car.images.map(async (image, index) => {
            const fileExt = image.name.split('.').pop();
            const filePath = `${carId}/${index}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('cars')
              .upload(filePath, image, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              return { success: false, error: uploadError };
            }
            
            return { success: true, path: filePath };
          });
          
          const uploadResults = await Promise.all(uploadPromises);
          const failedUploads = uploadResults.filter(result => !result.success).length;
          
          if (failedUploads > 0) {
            toast.error(`${failedUploads} תמונות לא הועלו בהצלחה`);
          } else if (uploadResults.length > 0) {
            toast.success(`הועלו ${uploadResults.length} תמונות בהצלחה`);
          }
        }

        return data;
      } catch (error) {
        console.error("Error adding car:", error);
        throw error;
      }
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
