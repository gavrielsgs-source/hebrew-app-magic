
import { useAuth } from "@/hooks/use-auth";

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

  // Simplified implementation - no database calls
  const documents: Document[] = [];
  const isLoading = false;
  const error = null;

  const uploadDocument = async (params: UploadDocumentParams) => {
    console.log('Document upload not implemented yet');
    throw new Error('Document functionality not available yet');
  };

  const deleteDocument = async (documentId: string) => {
    console.log('Document deletion not implemented yet');
    throw new Error('Document functionality not available yet');
  };

  const toggleTemplate = async (params: { documentId: string; isTemplate: boolean }) => {
    console.log('Template toggle not implemented yet');
    throw new Error('Document functionality not available yet');
  };

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    isUploading: false,
    deleteDocument,
    isDeleting: false,
    toggleTemplate,
    isTogglingTemplate: false,
  };
}
