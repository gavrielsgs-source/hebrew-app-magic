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
    
    // Filter only image files and keep order stable
    const imageFiles = data
      .filter(file => !file.name.startsWith('.') && file.name.match(/\.(jpeg|jpg|png|gif|webp|avif)$/i))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    
    if (imageFiles.length === 0) {
      console.log('[getCarImages] No image files found');
      return [];
    }
    
    console.log('[getCarImages] Image files:', imageFiles.map(f => f.name));
    
    // Use public URLs directly for faster loading and add a lightweight version token for refreshes
    const imageUrls: string[] = imageFiles.map(file => {
      const filePath = `${carId}/${file.name}`;
      const { data: urlData } = supabase
        .storage
        .from('cars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) return null;

      return `${urlData.publicUrl}?v=${encodeURIComponent(file.name)}`;
    }).filter(Boolean) as string[];
    
    console.log('[getCarImages] Final URLs:', imageUrls.length);
    return imageUrls;
  } catch (error) {
    console.error('[getCarImages] Error processing car images:', error);
    return [];
  }
}
