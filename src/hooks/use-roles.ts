
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

export function useRoles() {
  const { user } = useAuth();

  // Fetch user roles with company and agency information
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          agencies(name, company_id),
          companies(name)
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching user roles:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Check if user has specific role
  const hasRole = (role: UserRole, agencyId?: string, companyId?: string): boolean => {
    if (!userRoles.length) return false;

    return userRoles.some((userRole: any) => {
      if (userRole.role !== role) return false;
      
      if (agencyId && userRole.agency_id !== agencyId) return false;
      if (companyId && userRole.company_id !== companyId) return false;
      
      return true;
    });
  };

  // Role checking functions
  const isAdmin = (): boolean => hasRole('admin');
  const isCompanyOwner = (companyId?: string): boolean => hasRole('company_owner', undefined, companyId);
  const isAgencyManager = (agencyId?: string): boolean => hasRole('agency_manager', agencyId);
  const isSalesAgent = (agencyId?: string): boolean => hasRole('sales_agent', agencyId);
  const isViewer = (agencyId?: string): boolean => hasRole('viewer', agencyId);

  // General permissions
  const canManageLeads = (): boolean => {
    return isAdmin() || userRoles.some((role: any) => 
      ['company_owner', 'agency_manager', 'sales_agent'].includes(role.role)
    );
  };

  const canViewOnly = (): boolean => hasRole('viewer');

  // Get user companies
  const getUserCompanies = () => {
    const companyIds = new Set();
    userRoles.forEach((role: any) => {
      if (role.company_id) companyIds.add(role.company_id);
      if (role.agencies?.company_id) companyIds.add(role.agencies.company_id);
    });
    return Array.from(companyIds);
  };

  return {
    userRoles,
    isLoading,
    hasRole,
    isAdmin,
    isCompanyOwner,
    isAgencyManager,
    isSalesAgent,
    isViewer,
    canManageLeads,
    canViewOnly,
    getUserCompanies,
  };
}
