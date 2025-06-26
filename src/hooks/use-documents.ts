
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Document {
  id: string;
  created_at?: string;
  name: string;
  url: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  type: string;
  file_type?: string;
  file_path?: string;
  is_template?: boolean;
}

export interface UploadDocumentParams {
  file: File;
  name: string;
  type: string;
  entityId?: string;
  entityType?: 'lead' | 'car' | 'agency';
}

export function useDocuments(entityType?: string, entityId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch documents
  const {
    data: documents = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['documents', entityType, entityId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching documents with params:', { entityType, entityId, userId: user.id });

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Only filter by entity if both entityType and entityId are provided
      if (entityType && entityId) {
        query = query
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log('Fetched documents:', data);
      return data || [];
    },
    enabled: !!user,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (params: UploadDocumentParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Starting document upload with params:', params);

      try {
        // Create a unique file path
        const fileExt = params.file.name.split('.').pop() || 'bin';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        console.log('Upload file path:', filePath);

        // Upload the file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, params.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        console.log('File uploaded successfully:', uploadData);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log('Public URL:', publicUrl);

        // Save document metadata to database
        const documentData = {
          user_id: user.id,
          name: params.name,
          type: params.type,
          file_path: filePath,
          file_type: params.file.type,
          url: publicUrl,
          entity_type: params.entityType || null,
          entity_id: params.entityId || null,
        };

        console.log('Saving document metadata:', documentData);

        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert(documentData)
          .select()
          .single();

        if (docError) {
          console.error('Database insert error:', docError);
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('documents').remove([filePath]);
          throw new Error(`Failed to save document: ${docError.message}`);
        }

        console.log('Document saved successfully:', docData);
        return docData;

      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Document upload successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('המסמך הועלה בהצלחה');
    },
    onError: (error: Error) => {
      console.error('Upload mutation error:', error);
      toast.error(`שגיאה בהעלאת המסמך: ${error.message}`);
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
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

  const uploadDocument = uploadDocumentMutation.mutateAsync;
  const deleteDocument = deleteDocumentMutation.mutateAsync;

  const toggleTemplate = async (params: { documentId: string; isTemplate: boolean }) => {
    console.log('Template toggle not implemented yet');
    throw new Error('Document template functionality not available yet');
  };

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    isUploading: uploadDocumentMutation.isPending,
    deleteDocument,
    isDeleting: deleteDocumentMutation.isPending,
    toggleTemplate,
    isTogglingTemplate: false,
  };
}
