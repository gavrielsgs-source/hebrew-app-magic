
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewCar } from "@/types/car";

/**
 * Hook for updating a car
 */
export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...car }: NewCar & { id: string }) => {
      console.log("Starting car update with data:", { id, ...car });
      
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error("User authentication error:", userError);
          toast.error("לא ניתן לעדכן רכב", {
            description: "המשתמש אינו מחובר"
          });
          throw userError || new Error("User not authenticated");
        }

        const updateData = {
          make: car.make,
          model: car.model,
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
          status: car.status || "available",
          agency_id: car.agency_id || null,
          updated_at: new Date().toISOString()
        };

        console.log("Updating car with data:", updateData);

        const { data, error: carError } = await supabase
          .from("cars")
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (carError) {
          console.error("Car update error:", carError);
          toast.error("שגיאה בעדכון הרכב", {
            description: carError.message
          });
          throw carError;
        }

        console.log("Car updated successfully:", data);

        // Handle image uploads if provided
        if (car.images && car.images.length > 0) {
          console.log(`Uploading ${car.images.length} images for car ${id}`);
          const uploadPromises = car.images.map(async (image, index) => {
            const fileExt = image.name.split('.').pop();
            const filePath = `${id}/${index}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('cars')
              .upload(filePath, image, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (uploadError) {
              console.error(`Image upload error for image ${index}:`, uploadError);
              toast.error(`שגיאה בהעלאת תמונה ${index + 1}`, {
                description: uploadError.message
              });
              return { success: false, error: uploadError };
            }
            
            console.log(`Image ${index} uploaded successfully:`, filePath);
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

        toast.success("הרכב עודכן בהצלחה");
        return data;
      } catch (error) {
        console.error("Error updating car:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Car update mutation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (error) => {
      console.error("Car update mutation error:", error);
      toast.error("שגיאה בעדכון הרכב", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
