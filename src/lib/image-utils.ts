
import { supabase } from "@/integrations/supabase/client";

export async function getCarImages(carId: string): Promise<string[]> {
  try {
    // Check if images exist for this car ID
    const { data, error } = await supabase
      .storage
      .from('cars')
      .list(`${carId}`);
      
    if (error || !data) {
      console.error('Error fetching car images:', error);
      return [];
    }
    
    // Filter only image files
    const imageFiles = data.filter(file => 
      file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
    );
    
    if (imageFiles.length === 0) {
      return [];
    }
    
    // Get public URLs for each image
    const imageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const { data: urlData } = await supabase
          .storage
          .from('cars')
          .getPublicUrl(`${carId}/${file.name}`);
        return urlData.publicUrl;
      })
    );
    
    return imageUrls;
  } catch (error) {
    console.error('Error processing car images:', error);
    return [];
  }
}
