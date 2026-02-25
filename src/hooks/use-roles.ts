
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

export function useRoles() {
  const { user } = useAuth();

  // Fetch user roles with company and agency information
  const { data: userRoles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          return [];
        }

        // Enrich with agency and company names if needed
        if (data && data.length > 0) {
          const enrichedRoles = await Promise.all(
            data.map(async (role) => {
              let agencies = null;
              let companies = null;

              if (role.agency_id) {
                const { data: agencyData } = await supabase
                  .from("agencies")
                  .select("name, company_id")
                  .eq("id", role.agency_id)
                  .single();
                agencies = agencyData;
              }

              if (role.company_id) {
                const { data: companyData } = await supabase
                  .from("companies")
                  .select("name")
                  .eq("id", role.company_id)
                  .single();
                companies = companyData;
              }

              return {
                ...role,
                agencies,
                companies
              };
            })
          );
          return enrichedRoles;
        }

        return data || [];
      } catch (error) {
        console.error("Error in user roles query:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Fallback: check admin_emails table (matches DB is_admin() function)
  const { data: isAdminByEmail = false, isLoading: isAdminEmailLoading } = useQuery({
    queryKey: ["admin-email-check", user?.email],
    queryFn: async () => {
      if (!user?.email) return false;
      const { data, error } = await supabase
        .from("admin_emails")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();
      if (error) {
        console.error("Error checking admin_emails:", error);
        return false;
      }
      return !!data;
    },
    enabled: !!user?.email,
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
  const isAdmin = (): boolean => hasRole('admin') || isAdminByEmail;
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

  const isLoading = isRolesLoading || isAdminEmailLoading;

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
