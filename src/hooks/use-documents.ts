
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  file_type?: string;
  created_at: string;
  entity_id?: string;
  entity_type?: 'lead' | 'car' | 'agency';
  user_id: string;
  is_template?: boolean;
}

export interface UploadDocumentParams {
  file: File;
  name: string;
  type: string;
  entityId?: string;
  entityType?: 'lead' | 'car' | 'agency';
  isTemplate?: boolean;
}

export function useDocuments(entityId?: string, entityType?: 'lead' | 'car' | 'agency') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch documents
  const {
    data: documents,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["documents", entityId, entityType, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id);

      if (entityId && entityType) {
        query = query
          .eq("entity_id", entityId)
          .eq("entity_type", entityType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching documents: ${error.message}`);
      }

      return data as Document[];
    },
    enabled: !!user?.id
  });

  // Upload document
  const uploadDocumentMutation = useMutation({
    mutationFn: async (params: UploadDocumentParams) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // 1. Upload file to storage
      const fileExt = params.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/documents/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("documents")
        .upload(filePath, params.file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // 3. Save document metadata to database
      const { data: documentData, error: documentError } = await supabase
        .from("documents")
        .insert({
          name: params.name,
          type: params.type,
          file_path: filePath,
          file_type: params.file.type,
          url: publicUrlData.publicUrl,
          entity_id: params.entityId || null,
          entity_type: params.entityType || null,
          is_template: params.isTemplate || false,
          user_id: user.id
        })
        .select()
        .single();

      if (documentError) {
        throw documentError;
      }

      return documentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", entityId, entityType, user?.id] });
    }
  });

  // Toggle template status
  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ documentId, isTemplate }: { documentId: string; isTemplate: boolean }) => {
      const { error } = await supabase
        .from("documents")
        .update({ is_template: isTemplate })
        .eq("id", documentId);

      if (error) {
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", entityId, entityType, user?.id] });
    }
  });

  // Delete document
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      // 1. Get document data to find file path
      const { data: document, error: getDocError } = await supabase
        .from("documents")
        .select("file_path")
        .eq("id", documentId)
        .single();

      if (getDocError) {
        throw getDocError;
      }

      // 2. Delete from storage if file_path exists
      if (document?.file_path) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([document.file_path]);

        if (storageError) {
          console.error("Error removing file from storage:", storageError);
          // Continue with DB deletion even if storage deletion fails
        }
      }

      // 3. Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (dbError) {
        throw dbError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", entityId, entityType, user?.id] });
    }
  });

  return {
    documents,
    isLoading,
    error,
    refetch,
    uploadDocument: (params: UploadDocumentParams) => uploadDocumentMutation.mutateAsync(params),
    deleteDocument: (documentId: string) => deleteDocumentMutation.mutateAsync(documentId),
    toggleTemplate: (documentId: string, isTemplate: boolean) => 
      toggleTemplateMutation.mutateAsync({ documentId, isTemplate }),
    isUploading: uploadDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending,
    isTogglingTemplate: toggleTemplateMutation.isPending
  };
}
