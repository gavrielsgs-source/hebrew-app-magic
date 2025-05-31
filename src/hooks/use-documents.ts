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

  const uploadDocumentMutation = useMutation(
    async ({ file, name }: { file: File; name: string }) => {
      if (!user || !entityType || !entityId) {
        throw new Error("User, entityType, and entityId are required.");
      }

      const filePath = `documents/${user.id}/${entityType}/${entityId}/${name}`;

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

      const url = `${supabase.storageUrl}/documents/${filePath}`;

      const { error: dbError } = await supabase.from("documents").insert({
        name: name,
        url: url,
        entity_type: entityType,
        entity_id: entityId,
        user_id: user.id,
      });

      if (dbError) {
        console.error("Error saving document to database:", dbError);
        throw dbError;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["documents", user?.id, entityType, entityId]);
        toast.success("Document uploaded successfully!");
      },
      onError: (error: any) => {
        toast.error(`Failed to upload document: ${error.message}`);
      },
    }
  );

  const deleteDocumentMutation = useMutation(
    async (documentId: string) => {
      if (!user) {
        throw new Error("User is required.");
      }

      // Get the document URL from the database
      const { data: documentData, error: selectError } = await supabase
        .from("documents")
        .select("url")
        .eq("id", documentId)
        .single();

      if (selectError) {
        console.error("Error fetching document URL:", selectError);
        throw selectError;
      }

      if (!documentData || !documentData.url) {
        throw new Error("Document not found or URL is missing.");
      }

      // Extract the path from the URL
      const path = documentData.url.replace(`${supabase.storageUrl}/documents/`, "");

      // Delete the document from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([path]);

      if (storageError) {
        console.error("Error deleting document from storage:", storageError);
        throw storageError;
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
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["documents", user?.id, entityType, entityId]);
        toast.success("Document deleted successfully!");
      },
      onError: (error: any) => {
        toast.error(`Failed to delete document: ${error.message}`);
      },
    }
  );

  return {
    documents,
    isLoading,
    error,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    isUploading: uploadDocumentMutation.isLoading,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isDeleting: deleteDocumentMutation.isLoading,
  };
}
