
import { useUploadDocument } from "./documents/use-upload-document";
import { useDeleteDocument } from "./documents/use-delete-document";
import { useToggleTemplate } from "./documents/use-toggle-template";
import { useFetchDocuments } from "./documents/use-fetch-documents";

export type { Document, UploadDocumentParams } from "./documents/types";

export function useDocuments(entityType?: string, entityId?: string) {
  const {
    data: documents = [],
    isLoading,
    error
  } = useFetchDocuments(entityType, entityId);

  const uploadDocumentMutation = useUploadDocument();
  const deleteDocumentMutation = useDeleteDocument();
  const toggleTemplateMutation = useToggleTemplate();

  const uploadDocument = uploadDocumentMutation.mutateAsync;
  const deleteDocument = deleteDocumentMutation.mutateAsync;
  const toggleTemplate = toggleTemplateMutation.mutateAsync;

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    isUploading: uploadDocumentMutation.isPending,
    deleteDocument,
    isDeleting: deleteDocumentMutation.isPending,
    toggleTemplate,
    isTogglingTemplate: toggleTemplateMutation.isPending,
  };
}
