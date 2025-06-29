
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
      console.log("useUpdateCar - Starting car update with data:", { id, ...car });
      
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error("User authentication error:", userError);
          throw userError || new Error("User not authenticated");
        }

        console.log("useUpdateCar - User authenticated:", userData.user.id);

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
          entry_date: car.entry_date || null,
          license_number: car.license_number || null,
          chassis_number: car.chassis_number || null,
          next_test_date: car.next_test_date || null,
          updated_at: new Date().toISOString()
        };

        console.log("useUpdateCar - Updating car with data:", updateData);

        const { data, error: carError } = await supabase
          .from("cars")
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (carError) {
          console.error("Car update error:", carError);
          throw carError;
        }

        console.log("useUpdateCar - Car updated successfully:", data);

        // Handle image uploads if provided - with better error handling
        if (car.images && car.images.length > 0) {
          console.log(`useUpdateCar - Uploading ${car.images.length} images for car ${id}`);
          
          try {
            // First, delete existing images for this car
            const { data: existingFiles, error: listError } = await supabase
              .storage
              .from('cars')
              .list(`${id}`);
              
            if (!listError && existingFiles && existingFiles.length > 0) {
              const filesToDelete = existingFiles.map(file => `${id}/${file.name}`);
              const { error: deleteError } = await supabase
                .storage
                .from('cars')
                .remove(filesToDelete);
                
              if (deleteError) {
                console.warn("Error deleting existing images:", deleteError);
              } else {
                console.log("Deleted existing images successfully");
              }
            }

            const uploadPromises = car.images.map(async (image, index) => {
              const fileExt = image.name.split('.').pop();
              const filePath = `${id}/${index}-${Date.now()}.${fileExt}`;
              
              console.log(`Uploading image ${index}:`, filePath);
              
              const { error: uploadError } = await supabase.storage
                .from('cars')
                .upload(filePath, image, {
                  cacheControl: '3600',
                  upsert: false
                });
                
              if (uploadError) {
                console.error(`Image upload error for image ${index}:`, uploadError);
                return { success: false, error: uploadError, index };
              }
              
              console.log(`Image ${index} uploaded successfully:`, filePath);
              return { success: true, path: filePath, index };
            });
            
            const uploadResults = await Promise.all(uploadPromises);
            const failedUploads = uploadResults.filter(result => !result.success);
            const successfulUploads = uploadResults.filter(result => result.success);
            
            if (failedUploads.length > 0) {
              console.warn(`${failedUploads.length} images failed to upload:`, failedUploads);
              toast.error(`${failedUploads.length} תמונות לא הועלו בהצלחה`);
            }
            
            if (successfulUploads.length > 0) {
              console.log(`${successfulUploads.length} images uploaded successfully`);
              toast.success(`${successfulUploads.length} תמונות הועלו בהצלחה`);
            }
          } catch (imageError) {
            console.error("Error during image upload process:", imageError);
            toast.error("שגיאה בהעלאת תמונות");
          }
        }

        return data;
      } catch (error) {
        console.error("Error updating car:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("useUpdateCar - Car update mutation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (error) => {
      console.error("useUpdateCar - Car update mutation error:", error);
    }
  });
}
