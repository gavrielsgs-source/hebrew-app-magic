import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Car, NewCar } from "@/types/car";

export function useCars() {
  const queryClient = useQueryClient();

  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("שגיאה בטעינת רכבים", {
          description: error.message
        });
        throw error;
      }

      return data as Car[];
    },
    retry: 2
  });

  const addCar = useMutation({
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
            user_id: userData.user.id
          })
          .select()
          .single();

        if (carError) {
          toast.error("שגיאה בהוספת רכב", {
            description: carError.message
          });
          throw carError;
        }

        if (car.images && car.images.length > 0 && data.id) {
          const carId = data.id;
          
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
              toast.error(`שגיאה בהעלאת תמונה ${index + 1}`, {
                description: uploadError.message
              });
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
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("שגיאה בהוספת רכב", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const updateCar = useMutation({
    mutationFn: async ({ id, ...car }: NewCar & { id: string }) => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          toast.error("לא ניתן לעדכן רכב", {
            description: "המשתמש אינו מחובר"
          });
          throw userError || new Error("User not authenticated");
        }

        const { data, error: carError } = await supabase
          .from("cars")
          .update({
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
            status: car.status || "available", // Use provided status or default to "available"
          })
          .eq('id', id)
          .select()
          .single();

        if (carError) {
          toast.error("שגיאה בעדכון הרכב", {
            description: carError.message
          });
          throw carError;
        }

        if (car.images && car.images.length > 0) {
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
              toast.error(`שגיאה בהעלאת תמונה ${index + 1}`, {
                description: uploadError.message
              });
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

        toast.success("הרכב עודכן בהצלחה");
        return data;
      } catch (error) {
        console.error("Error updating car:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("שגיאה בעדכון הרכב", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return {
    cars,
    isLoading,
    error,
    addCar,
    updateCar
  };
}
