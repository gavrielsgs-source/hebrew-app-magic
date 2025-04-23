
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, UserRoleAssignment } from "@/types/user";

interface UserWithEmail {
  id: string;
  email: string;
  roles?: UserRoleAssignment[]; // Add the roles property as optional
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
        .select('id, email:id');

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("שגיאה בטעינת משתמשים");
        return [];
      }

      return data as UserWithEmail[];
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

      return data as UserRoleAssignment[];
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

        return data as UserRoleAssignment;
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
