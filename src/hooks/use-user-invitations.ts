import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserInvitation, UserRole } from "@/types/user";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";

export function useUserInvitations(companyId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch invitations for a company
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["user-invitations", companyId],
    queryFn: async (): Promise<UserInvitation[]> => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching invitations:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!companyId,
  });

  // Send invitation
  const sendInvitation = useMutation({
    mutationFn: async ({
      companyId,
      email,
      role,
      agencyId,
    }: {
      companyId: string;
      email: string;
      role: UserRole;
      agencyId?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("user_invitations")
        .insert([{
          company_id: companyId,
          email,
          role,
          agency_id: agencyId || null,
          invited_by: user.id,
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Error sending invitation:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      toast.success("ההזמנה נשלחה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error);
      toast.error("שגיאה בשליחת ההזמנה");
    },
  });

  // Cancel invitation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("user_invitations")
        .delete()
        .eq("id", invitationId);
      
      if (error) {
        console.error("Error canceling invitation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      toast.success("ההזמנה בוטלה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to cancel invitation:", error);
      toast.error("שגיאה בביטול ההזמנה");
    },
  });

  // Accept invitation (for invited users)
  const acceptInvitation = useMutation({
    mutationFn: async (token: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      // First, get the invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("token", token)
        .single();
      
      if (fetchError || !invitation) {
        throw new Error("הזמנה לא תקינה או שפגה תוקפה");
      }

      // Check if invitation is still valid
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error("תוקף ההזמנה פג");
      }

      // Create user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{
          user_id: user.id,
          role: invitation.role,
          agency_id: invitation.agency_id,
          company_id: invitation.company_id,
        }]);

      if (roleError) {
        console.error("Error creating user role:", roleError);
        throw roleError;
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error updating invitation:", updateError);
        throw updateError;
      }

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast.success("ההזמנה התקבלה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to accept invitation:", error);
      toast.error("שגיאה בקבלת ההזמנה");
    },
  });

  return {
    invitations,
    isLoading,
    sendInvitation,
    cancelInvitation,
    acceptInvitation,
  };
}