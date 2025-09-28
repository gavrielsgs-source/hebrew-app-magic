
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  agency_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useRealUserManagement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all users from auth.users (admin only)
  const { data: allUsers = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<AuthUser[]> => {
      console.log("Fetching all users...");
      
      // This RPC call will only work if the user is admin due to RLS
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Fetch user roles with company information
  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async (): Promise<UserRoleData[]> => {
      console.log("Fetching user roles...");
      
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          agencies(name, company_id),
          companies(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching user roles:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Get roles for specific user
  const getUserRoles = async (userId: string): Promise<UserRoleData[]> => {
    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        *,
        agencies(name, company_id),
        companies(name)
      `)
      .eq("user_id", userId);
    
    if (error) {
      console.error("Error fetching user roles:", error);
      throw error;
    }
    
    return data || [];
  };

  // Assign role to user (now company-aware)
  const assignRole = useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      agencyId, 
      companyId 
    }: { 
      userId: string; 
      role: UserRole; 
      agencyId?: string;
      companyId?: string;
    }) => {
      const { data, error } = await supabase
        .from("user_roles")
        .insert([{
          user_id: userId,
          role: role,
          agency_id: agencyId || null,
          company_id: companyId || null,
        }]);
      
      if (error) {
        console.error("Error assigning role:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("התפקיד הוקצה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to assign role:", error);
      toast.error("שגיאה בהקצאת התפקיד");
    },
  });

  // Remove role from user
  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      
      if (error) {
        console.error("Error removing role:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("התפקיד הוסר בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to remove role:", error);
      toast.error("שגיאה בהסרת התפקיד");
    },
  });

  return {
    allUsers,
    isLoading: usersLoading || rolesLoading,
    error: usersError,
    userRoles,
    getUserRoles,
    assignRole,
    removeRole,
  };
}
