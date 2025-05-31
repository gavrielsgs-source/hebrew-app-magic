
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const {
    data: documents,
    isLoading,
    error,
  } = useQuery<Document[]>({
    queryKey: ["documents", user?.id, entityType, entityId],
    queryFn: async () => {
      if (!user || !entityType || !entityId) return [];

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!entityType && !!entityId,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, name, type, entityId, entityType }: UploadDocumentParams) => {
      if (!user) {
        throw new Error("User is required.");
      }

      const filePath = `documents/${user.id}/${entityType || 'general'}/${entityId || 'unlinked'}/${name}`;

      const { data, error } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      const url = `https://zjmkdmmnajzevoupgfhg.supabase.co/storage/v1/object/public/documents/${filePath}`;

      const { error: dbError } = await supabase.from("documents").insert({
        name: name,
        url: url,
        type: type,
        entity_type: entityType || null,
        entity_id: entityId || null,
        user_id: user.id,
        file_type: file.type,
        file_path: filePath,
      });

      if (dbError) {
        console.error("Error saving document to database:", dbError);
        throw dbError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id, entityType, entityId] });
      toast.success("Document uploaded successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user) {
        throw new Error("User is required.");
      }

      // Get the document URL from the database
      const { data: documentData, error: selectError } = await supabase
        .from("documents")
        .select("url, file_path")
        .eq("id", documentId)
        .single();

      if (selectError) {
        console.error("Error fetching document URL:", selectError);
        throw selectError;
      }

      if (!documentData) {
        throw new Error("Document not found.");
      }

      // Delete the document from storage if file_path exists
      if (documentData.file_path) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([documentData.file_path]);

        if (storageError) {
          console.error("Error deleting document from storage:", storageError);
        }
      }

      // Delete the document from the database
      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (deleteError) {
        console.error("Error deleting document from database:", deleteError);
        throw deleteError;
      }

      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id, entityType, entityId] });
      toast.success("Document deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ documentId, isTemplate }: { documentId: string; isTemplate: boolean }) => {
      if (!user) {
        throw new Error("User is required.");
      }

      const { error } = await supabase
        .from("documents")
        .update({ is_template: isTemplate })
        .eq("id", documentId);

      if (error) {
        console.error("Error updating template status:", error);
        throw error;
      }

      return { documentId, isTemplate };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id, entityType, entityId] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update template status: ${error.message}`);
    },
  });

  return {
    documents,
    isLoading,
    error,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    isUploading: uploadDocumentMutation.isPending,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isDeleting: deleteDocumentMutation.isPending,
    toggleTemplate: toggleTemplateMutation.mutateAsync,
    isTogglingTemplate: toggleTemplateMutation.isPending,
  };
}
