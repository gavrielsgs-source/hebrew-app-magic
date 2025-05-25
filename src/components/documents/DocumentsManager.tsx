
import { useState } from "react";
import { toast } from "sonner";
import { useDocuments, type UploadDocumentParams } from "@/hooks/use-documents";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useIsMobile } from "@/hooks/use-mobile";
import { DocumentFilters } from "./components/DocumentFilters";
import { UploadDocumentDialog } from "./components/UploadDocumentDialog";
import { DocumentCard } from "./components/DocumentCard";
import { DocumentWhatsAppDialog } from "./components/DocumentWhatsAppDialog";
import type { DocumentsManagerProps, DocumentFormData } from "./types";
import type { Document } from "@/hooks/use-documents";

export function DocumentsManager({ entityId, entityType }: DocumentsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    file: null,
    documentName: "",
    documentType: "contract",
    selectedEntityId: entityId || null,
    selectedEntityType: entityType || null,
  });
  
  const isMobile = useIsMobile();
  
  const { 
    documents, 
    isLoading, 
    error, 
    uploadDocument, 
    deleteDocument, 
    toggleTemplate,
    isUploading, 
    isDeleting,
    isTogglingTemplate
  } = useDocuments(
    formData.selectedEntityId || entityId, 
    formData.selectedEntityType || entityType
  );
  
  const { leads, isLoading: isLeadsLoading } = useLeads();
  const { cars, isLoading: isCarsLoading } = useCars();
  
  // סינון מסמכים לפי החיפוש והסוג
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !documentTypeFilter || doc.type === documentTypeFilter;
    return matchesSearch && matchesType;
  });
  
  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      toast.success("המסמך נמחק בהצלחה");
    } catch (error) {
      toast.error("שגיאה במחיקת המסמך");
      console.error(error);
    }
  };

  const handleToggleTemplate = async (documentId: string, isTemplate: boolean) => {
    try {
      await toggleTemplate(documentId, isTemplate);
      toast.success(isTemplate ? "המסמך נשמר כתבנית" : "המסמך הוסר מהתבניות");
    } catch (error) {
      toast.error("שגיאה בעדכון סטטוס התבנית");
      console.error(error);
    }
  };

  const handleSendWhatsApp = (document: Document) => {
    setSelectedDocument(document);
    setIsWhatsAppDialogOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      file: null,
      documentName: "",
      documentType: "contract",
      selectedEntityId: entityId || null,
      selectedEntityType: entityType || null,
    });
  };

  const updateFormData = (updates: Partial<DocumentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  if (error) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-red-500 text-right">שגיאה בטעינת מסמכים: {error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DocumentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          documentTypeFilter={documentTypeFilter}
          onTypeFilterChange={setDocumentTypeFilter}
        />
        
        <div className="flex gap-2">
          <UploadDocumentDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            formData={formData}
            onFormChange={updateFormData}
            onUpload={uploadDocument}
            onReset={resetForm}
            isUploading={isUploading}
            entityId={entityId}
            entityType={entityType}
            leads={leads}
            cars={cars}
            isLeadsLoading={isLeadsLoading}
            isCarsLoading={isCarsLoading}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">טוען מסמכים...</p>
        </div>
      ) : filteredDocuments?.length === 0 ? (
        <div className="text-center border rounded-lg p-8">
          <p className="text-muted-foreground mb-2">לא נמצאו מסמכים</p>
          <p className="text-sm text-muted-foreground">העלה מסמכים חדשים באמצעות כפתור "העלאת מסמך"</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className={`grid gap-4 p-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredDocuments?.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDelete}
                onToggleTemplate={handleToggleTemplate}
                onSendWhatsApp={handleSendWhatsApp}
                isDeleting={isDeleting || isTogglingTemplate}
                isMobile={isMobile}
                leads={leads}
                cars={cars}
              />
            ))}
          </div>
        </div>
      )}

      <DocumentWhatsAppDialog
        isOpen={isWhatsAppDialogOpen}
        onClose={() => setIsWhatsAppDialogOpen(false)}
        document={selectedDocument}
      />
    </div>
  );
}
