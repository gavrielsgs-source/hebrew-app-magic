
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting document:', documentId);

      // First get the document details
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching document for deletion:', fetchError);
        throw new Error('Document not found');
      }

      // Delete from storage if file_path exists
      if (document.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Database deletion error:', deleteError);
        throw new Error(`Failed to delete document: ${deleteError.message}`);
      }

      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('המסמך נמחק בהצלחה');
    },
    onError: (error: Error) => {
      console.error('Delete mutation error:', error);
      toast.error(`שגיאה במחיקת המסמך: ${error.message}`);
    },
  });
}
