
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { UploadDocumentParams } from "./types";

export function useUploadDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
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
}
