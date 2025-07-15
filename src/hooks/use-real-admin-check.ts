
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRealAdminCheck() {
  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["admin-check"],
    queryFn: async (): Promise<boolean> => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          return false;
        }
        
        return data || false;
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    },
  });

  return {
    isAdmin,
    isLoading,
  };
}
