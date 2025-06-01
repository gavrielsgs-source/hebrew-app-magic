
import { useAuth } from "@/hooks/use-auth";

export function useRoles() {
  const { user } = useAuth();

  // Simplified implementation - no database calls
  const userRoles: any[] = [];
  const isLoading = false;

  const hasRole = () => false;
  const isAdmin = () => false;
  const isAgencyManager = () => false;
  const isSalesAgent = () => false;
  const canManageLeads = () => true; // Allow basic access
  const canViewOnly = () => false;

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
