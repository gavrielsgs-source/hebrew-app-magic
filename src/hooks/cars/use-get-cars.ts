
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Car } from "@/types/car";

/**
 * Hook for fetching car data
 */
export function useGetCars() {
  return useQuery({
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
}
