
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
