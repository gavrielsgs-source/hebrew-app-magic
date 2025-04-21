
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, UserRoleAssignment } from "@/types/user";

export function useRoles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          toast.error("שגיאה בטעינת הרשאות משתמש");
          throw error;
        }

        return data as UserRoleAssignment[];
      } catch (error) {
        console.error("Error in roles query:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
  });

  const hasRole = (role: UserRole, agencyId?: string) => {
    if (!userRoles?.length) return false;
    
    // Admin has access to everything
    if (userRoles.some(r => r.role === 'admin')) return true;
    
    // Check for specific role
    if (agencyId) {
      return userRoles.some(r => 
        r.role === role && (r.agency_id === agencyId || r.agency_id === null)
      );
    }
    
    return userRoles.some(r => r.role === role);
  };

  const isAdmin = () => hasRole('admin');

  return {
    userRoles,
    isLoading,
    hasRole,
    isAdmin
  };
}
