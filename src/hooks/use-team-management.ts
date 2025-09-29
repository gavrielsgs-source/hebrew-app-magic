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

  // Fetch team users from database
  const { data: teamUsers = [], isLoading, error } = useQuery({
    queryKey: ["team-users", user?.id],
    queryFn: async (): Promise<TeamUser[]> => {
      if (!user) return [];

      // First, get or create company for the user
      let { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      // If no company exists, create one
      if (!company) {
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: `חברת ${user.email?.split('@')[0] || 'ללא שם'}`,
            owner_id: user.id,
          })
          .select()
          .single();

        if (companyError) {
          console.error("Error creating company:", companyError);
          throw companyError;
        }
        company = newCompany;
      }

      // Get user profile for better name display
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Get all user invitations for this company
      const { data: invitations } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("company_id", company.id)
        .is("accepted_at", null); // Only pending invitations

      // Build team users array
      const users: TeamUser[] = [
        {
          id: user.id,
          email: user.email || '',
          name: profile?.full_name || 'בעל החשבון',
          role: 'admin' as const,
          isOwner: true,
          joinedAt: new Date().toISOString(),
        }
      ];

      // Add pending invitations as team users
      if (invitations) {
        invitations.forEach(invitation => {
          users.push({
            id: invitation.id,
            email: invitation.email,
            name: `הזמנה נשלחה`,
            role: invitation.role as TeamUserRole,
            isOwner: false,
            joinedAt: invitation.created_at,
          });
        });
      }

      return users;
    },
    enabled: !!user,
  });

  // Add team user mutation - connects to send-invitation edge function
  const addTeamUser = useMutation({
    mutationFn: async (userData: AddTeamUserData) => {
      if (!user) throw new Error("User not authenticated");

      // Get or create company first
      let { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (!company) {
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: `חברת ${user.email?.split('@')[0] || 'ללא שם'}`,
            owner_id: user.id,
          })
          .select()
          .single();

        if (companyError) {
          throw new Error("Failed to create company");
        }
        company = newCompany;
      }

      // Get or create default agency
      let { data: agency } = await supabase
        .from("agencies")
        .select("*")
        .eq("company_id", company.id)
        .single();

      if (!agency) {
        const { data: newAgency, error: agencyError } = await supabase
          .from("agencies")
          .insert({
            name: `${company.name} - סוכנות ראשית`,
            owner_id: user.id,
            company_id: company.id,
          })
          .select()
          .single();

        if (agencyError) {
          throw new Error("Failed to create agency");
        }
        agency = newAgency;
      }

      // Call the send-invitation edge function
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: userData.email,
          role: userData.role,
          companyId: company.id,
          agencyId: agency.id,
          companyName: company.name,
        }
      });

      if (error) {
        console.error("Error sending invitation:", error);
        throw new Error(error.message || "Failed to send invitation");
      }

      return data;
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

      // Update invitation role (if it's a pending invitation)
      const { error } = await supabase
        .from("user_invitations")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        throw new Error("Failed to update user role");
      }

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

      // Delete invitation
      const { error } = await supabase
        .from("user_invitations")
        .delete()
        .eq("id", userId);

      if (error) {
        throw new Error("Failed to remove user");
      }

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