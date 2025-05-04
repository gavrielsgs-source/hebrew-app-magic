
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Utility function to upload car images
 * @param carId The ID of the car
 * @param images Array of image files to upload
 * @returns Promise with upload results
 */
export async function uploadCarImages(carId: string, images: File[]) {
  if (!images || images.length === 0) return [];
  
  const uploadPromises = images.map(async (image, index) => {
    const fileExt = image.name.split('.').pop();
    const filePath = `${carId}/${index}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('cars')
      .upload(filePath, image, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      toast.error(`שגיאה בהעלאת תמונה ${index + 1}`, {
        description: uploadError.message
      });
      return { success: false, error: uploadError, path: null };
    }
    
    return { success: true, path: filePath, error: null };
  });
  
  return Promise.all(uploadPromises);
}
