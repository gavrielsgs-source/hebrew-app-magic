import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserInvitation } from "@/types/user";
import { toast } from "sonner";

export function useUserInvitations(companyId?: string) {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["user-invitations", companyId] });
      toast.success("ההזמנה בוטלה בהצלחה");
    },
    onError: (error) => {
      console.error("Failed to cancel invitation:", error);
      toast.error("שגיאה בביטול ההזמנה");
    },
  });

  return {
    invitations,
    isLoading,
    cancelInvitation,
  };
}