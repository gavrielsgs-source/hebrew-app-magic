
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewCar } from "@/types/car";

/**
 * Hook for adding a new car
 */
export function useAddCar() {
  const queryClient = useQueryClient();
  const defaultAgencyId = null; // Will be overridden by the passed agency_id

  return useMutation({
    mutationFn: async (car: NewCar) => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          toast.error("לא ניתן להוסיף רכב", {
            description: "המשתמש אינו מחובר"
          });
          throw userError || new Error("User not authenticated");
        }

        const { data, error: carError } = await supabase
          .from("cars")
          .insert({
            make: car.make,
            model: car.model,
            trim_level: car.trim_level || null,
            year: car.year,
            kilometers: car.kilometers,
            price: car.price,
            description: car.description || null,
            interior_color: car.interior_color || null,
            exterior_color: car.exterior_color || null,
            transmission: car.transmission || null,
            fuel_type: car.fuel_type || null,
            engine_size: car.engine_size || null,
            registration_year: car.registration_year || null,
            last_test_date: car.last_test_date || null,
            ownership_history: car.ownership_history || null,
            status: "available",
            agency_id: car.agency_id || defaultAgencyId,
            user_id: userData.user.id,
            entry_date: car.entry_date || null,
            license_number: car.license_number || null,
            chassis_number: car.chassis_number || null,
            next_test_date: car.next_test_date || null
          })
          .select()
          .single();

        if (carError) {
          toast.error("שגיאה בהוספת רכב", {
            description: carError.message
          });
          throw carError;
        }

        // Upload images in background to improve performance
        if (car.images && car.images.length > 0 && data.id) {
          const carId = data.id;
          
          // Upload images in parallel for better performance
          const uploadPromises = car.images.map(async (image, index) => {
            const fileExt = image.name.split('.').pop();
            const filePath = `${carId}/${index}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('cars')
              .upload(filePath, image, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (uploadError) {
              console.error(`Error uploading image ${index + 1}:`, uploadError);
              return { success: false, error: uploadError };
            }
            
            return { success: true, path: filePath };
          });
          
          // Don't wait for image uploads to complete before showing success
          Promise.all(uploadPromises).then((uploadResults) => {
            const failedUploads = uploadResults.filter(result => !result.success).length;
            
            if (failedUploads > 0) {
              toast.error(`${failedUploads} תמונות לא הועלו בהצלחה`);
            }
          });
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
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("שגיאה בהוספת רכב", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
