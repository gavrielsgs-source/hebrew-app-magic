import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserWithEmail {
  id: string;
  email: string;
  full_name?: string;
  roles?: UserRoleAssignment[];
}

export function useUserManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // מביא את כל המשתמשים מטבלת auth.users (רק אדמינים יכולים לעשות זאת)
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // בדיקה האם המשתמש הוא אדמין
      const { data: roleCheck, error: roleError } = await supabase.rpc('has_role', { 
        role_name: 'admin'
      });
      
      if (roleError || !roleCheck) {
        console.error("User is not admin:", roleError);
        return [];
      }

      // קבלת המשתמשים מהשרת (צריך להיות אדמין)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email:id, full_name');

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("שגיאה בטעינת משתמשים");
        return [];
      }

      // Convert unknown data to proper types with validation
      const usersData: UserWithEmail[] = (data || []).map((item: any) => ({
        id: String(item.id || ''),
        email: String(item.id || ''), // Using id as email for now
        full_name: item.full_name ? String(item.full_name) : undefined
      }));

      // קבלת רולים של כל המשתמשים
      const usersWithRoles = await Promise.all(
        usersData.map(async (userItem: UserWithEmail) => {
          try {
            const roles = await getUserRoles(userItem.id);
            return {
              ...userItem,
              roles
            };
          } catch (error) {
            console.error(`Error fetching roles for user ${userItem.id}:`, error);
            return {
              ...userItem,
              roles: []
            };
          }
        })
      );

      return usersWithRoles as UserWithEmail[];
    },
    enabled: !!user,
  });

  // קבלת הרשאות של משתמש ספציפי
  const getUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user roles:", error);
        toast.error("שגיאה בטעינת הרשאות משתמש");
        throw error;
      }

      // Convert unknown data to UserRoleAssignment type with proper validation
      const validRoles: UserRoleAssignment[] = (data || []).map((item: any) => ({
        id: String(item.id || ''),
        user_id: String(item.user_id || ''),
        role: String(item.role || '') as UserRole,
        agency_id: item.agency_id ? String(item.agency_id) : null,
        created_at: String(item.created_at || new Date().toISOString()),
        updated_at: String(item.updated_at || new Date().toISOString())
      }));

      return validRoles;
    } catch (error) {
      console.error("Error in getUserRoles:", error);
      throw error;
    }
  };

  // הוספת תפקיד למשתמש
  const assignRole = useMutation({
    mutationFn: async ({ userId, role, agencyId }: { userId: string; role: UserRole; agencyId?: string }) => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role,
            agency_id: agencyId || null
          })
          .select()
          .single();

        if (error) {
          console.error("Error assigning role:", error);
          toast.error("שגיאה בהקצאת תפקיד למשתמש");
          throw error;
        }

        // Convert result to proper type
        const roleAssignment: UserRoleAssignment = {
          id: String(data.id),
          user_id: String(data.user_id),
          role: String(data.role) as UserRole,
          agency_id: data.agency_id ? String(data.agency_id) : null,
          created_at: String(data.created_at),
          updated_at: String(data.updated_at)
        };

        return roleAssignment;
      } catch (error) {
        console.error("Error in assignRole:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("התפקיד הוקצה בהצלחה");
    }
  });

  // הסרת תפקיד ממשתמש
  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      try {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("id", roleId);

        if (error) {
          console.error("Error removing role:", error);
          toast.error("שגיאה בהסרת תפקיד ממשתמש");
          throw error;
        }
      } catch (error) {
        console.error("Error in removeRole:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("התפקיד הוסר בהצלחה");
    }
  });

  return {
    allUsers,
    isLoading,
    getUserRoles,
    assignRole,
    removeRole
  };
}
