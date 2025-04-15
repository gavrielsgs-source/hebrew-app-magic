
import { supabase } from "@/integrations/supabase/client";

export async function getCarImages(carId: string): Promise<string[]> {
  try {
    // Check if the cars bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const carsBucketExists = buckets?.some(bucket => bucket.name === 'cars');
    
    if (!carsBucketExists) {
      console.log('Cars bucket does not exist, creating it...');
      const { error } = await supabase.storage.createBucket('cars', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        console.error('Error creating cars bucket:', error);
        return [];
      }
    }
    
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
