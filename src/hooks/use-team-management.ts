import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { TeamUser, TeamUserRole } from "@/components/team/TeamUsersTable";

interface AddTeamUserData {
  name: string;
  email: string;
  role: TeamUserRole;
}

export function useTeamManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch team users
  const { data: teamUsers = [], isLoading, error } = useQuery({
    queryKey: ["team-users", user?.id],
    queryFn: async (): Promise<TeamUser[]> => {
      if (!user) return [];

      // For now, return the current user as owner
      // TODO: Implement actual team users fetching from database
      return [
        {
          id: user.id,
          email: user.email || '',
          name: 'בעל החשבון',
          role: 'admin' as const,
          isOwner: true,
          joinedAt: new Date().toISOString(),
        }
      ];
    },
    enabled: !!user,
  });

  // Add team user mutation
  const addTeamUser = useMutation({
    mutationFn: async (userData: AddTeamUserData) => {
      if (!user) throw new Error("User not authenticated");

      // TODO: Implement actual user invitation logic
      // This would typically:
      // 1. Create user invitation in database
      // 2. Send invitation email
      // 3. Return the created invitation
      
      console.log('Adding team user:', userData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: Math.random().toString(),
        ...userData,
        joinedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("המשתמש נוסף בהצלחה! הזמנה נשלחה באימייל.");
    },
    onError: (error: any) => {
      console.error("Error adding team user:", error);
      toast.error(error.message || "שגיאה בהוספת המשתמש");
    },
  });

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: TeamUserRole }) => {
      if (!user) throw new Error("User not authenticated");

      // TODO: Implement actual role update logic
      console.log('Updating user role:', { userId, newRole });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { userId, newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("תפקיד המשתמש עודכן בהצלחה");
    },
    onError: (error: any) => {
      console.error("Error updating user role:", error);
      toast.error(error.message || "שגיאה בעדכון תפקיד המשתמש");
    },
  });

  // Remove team user mutation
  const removeTeamUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("User not authenticated");

      // TODO: Implement actual user removal logic
      console.log('Removing team user:', userId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("המשתמש הוסר מהצוות");
    },
    onError: (error: any) => {
      console.error("Error removing team user:", error);
      toast.error(error.message || "שגיאה בהסרת המשתמש");
    },
  });

  return {
    teamUsers,
    isLoading,
    error,
    addTeamUser,
    updateUserRole,
    removeTeamUser,
  };
}