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
    
    // Try to get signed URLs (works for both public and private buckets)
    const imageUrls: string[] = [];
    
    for (const file of imageFiles) {
      const filePath = `${carId}/${file.name}`;
      
      // First try signed URL (works for authenticated users)
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from('cars')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (signedData?.signedUrl) {
        console.log('[getCarImages] Got signed URL for:', file.name);
        imageUrls.push(signedData.signedUrl);
      } else {
        // Fallback to public URL
        console.log('[getCarImages] Signed URL failed, trying public URL for:', file.name, signedError);
        const { data: urlData } = supabase
          .storage
          .from('cars')
          .getPublicUrl(filePath);
        
        if (urlData?.publicUrl) {
          imageUrls.push(urlData.publicUrl);
        }
      }
    }
    
    console.log('[getCarImages] Final URLs:', imageUrls.length);
    return imageUrls;
  } catch (error) {
    console.error('[getCarImages] Error processing car images:', error);
    return [];
  }
}
