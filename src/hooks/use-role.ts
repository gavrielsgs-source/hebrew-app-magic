import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface Role {
  id: string;
  name: string;
}

export function useRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["role", user?.id],
    queryFn: async (): Promise<Role | null> => {
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", user.role_id)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }

      return data || null;
    },
    enabled: !!user?.role_id,
  });
}
