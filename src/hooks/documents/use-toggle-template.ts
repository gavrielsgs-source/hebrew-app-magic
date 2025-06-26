
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function useToggleTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { documentId: string; isTemplate: boolean }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Toggling template status:', params);

      const { error } = await supabase
        .from('documents')
        .update({ is_template: params.isTemplate })
        .eq('id', params.documentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Template toggle error:', error);
        throw new Error(`Failed to update template status: ${error.message}`);
      }

      return params;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: Error) => {
      console.error('Toggle template mutation error:', error);
      throw error;
    },
  });
}
