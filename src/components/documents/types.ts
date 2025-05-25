
export interface DocumentsManagerProps {
  entityId?: string;
  entityType?: 'lead' | 'car' | 'agency';
}

export interface DocumentFormData {
  file: File | null;
  documentName: string;
  documentType: string;
  selectedEntityId: string | null;
  selectedEntityType: 'lead' | 'car' | 'agency' | null;
}
