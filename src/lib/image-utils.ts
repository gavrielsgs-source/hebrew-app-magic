import { supabase } from "@/integrations/supabase/client";

export async function getCarImages(carId: string): Promise<string[]> {
  try {
    console.log('[getCarImages] Fetching images for car:', carId);
    
    // Check if images exist for this car ID
    const { data, error } = await supabase
      .storage
      .from('cars')
      .list(`${carId}`);
      
    if (error) {
      console.error('[getCarImages] Error listing files:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('[getCarImages] No files found for car:', carId);
      return [];
    }
    
    console.log('[getCarImages] Found files:', data.map(f => f.name));
    
    // Filter only image files
    const imageFiles = data.filter(file => 
      file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
    );
    
    if (imageFiles.length === 0) {
      console.log('[getCarImages] No image files found');
      return [];
    }
    
    console.log('[getCarImages] Image files:', imageFiles.map(f => f.name));
    
    // Use public URLs directly for faster loading (bucket is public)
    const imageUrls: string[] = imageFiles.map(file => {
      const filePath = `${carId}/${file.name}`;
      const { data: urlData } = supabase
        .storage
        .from('cars')
        .getPublicUrl(filePath);
      return urlData?.publicUrl;
    }).filter(Boolean) as string[];
    
    console.log('[getCarImages] Final URLs:', imageUrls.length);
    return imageUrls;
  } catch (error) {
    console.error('[getCarImages] Error processing car images:', error);
    return [];
  }
}
