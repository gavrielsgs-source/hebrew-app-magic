
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useRole(userId?: string) {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    async function fetchUserRole() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } else {
          setRole(data?.role || null);
        }
      } catch (error) {
        console.error("Error in useRole hook:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, [userId]);

  return { role, isLoading };
}
