
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
        // For now, return empty array since user_roles table doesn't exist
        console.log('User roles table not available, returning empty roles for user:', user.id);
        return [] as UserRoleAssignment[];
      } catch (error) {
        console.error("Error in roles query:", error);
        return [] as UserRoleAssignment[];
      }
    },
    enabled: !!user,
    retry: 1,
  });

  const hasRole = (role: UserRole, agencyId?: string) => {
    // Since no roles table exists, default to basic access
    return false;
  };

  const isAdmin = () => false;
  
  const isAgencyManager = (agencyId?: string) => false;
  
  const isSalesAgent = (agencyId?: string) => false;

  const canManageLeads = (agencyId?: string) => {
    // Allow basic lead management since no roles system
    return true;
  };

  const canViewOnly = () => {
    // Default to full access since no roles system
    return false;
  };

  return {
    userRoles,
    isLoading,
    hasRole,
    isAdmin,
    isAgencyManager,
    isSalesAgent,
    canManageLeads,
    canViewOnly
  };
}
