
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDocuments, type UploadDocumentParams } from "@/hooks/use-documents";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import type { DocumentFormData } from "../types";

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DocumentFormData;
  onFormChange: (updates: Partial<DocumentFormData>) => void;
  onUpload: (params: UploadDocumentParams) => Promise<void>;
  onReset: () => void;
  isUploading: boolean;
  entityId?: string | null;
  entityType?: string | null;
  leads?: any[];
  cars?: any[];
  isLeadsLoading?: boolean;
  isCarsLoading?: boolean;
}

export function UploadDocumentDialog({
  isOpen,
  onOpenChange,
  formData,
  onFormChange,
  onUpload,
  onReset,
  isUploading,
  entityId,
  entityType,
  leads = [],
  cars = [],
  isLeadsLoading = false,
  isCarsLoading = false,
}: UploadDocumentDialogProps) {
  const { documents } = useDocuments();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFormChange({ 
        file, 
        documentName: formData.documentName || file.name.split('.')[0] 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.documentName) {
      toast.error("יש להזין שם מסמך ולבחור קובץ");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentCount = documents?.length || 0;
      console.log('🔍 [UploadDocumentDialog] Current documents count:', currentCount);
      
      // כרגע אין מגבלה על מסמכים, אבל אפשר להוסיף בעתיד
      // const canProceed = checkAndNotifyLimit('document', currentCount);
      // if (!canProceed) {
      //   setIsSubmitting(false);
      //   return;
      // }

      await onUpload({
        file: formData.file,
        name: formData.documentName,
        type: formData.documentType,
        entityId: formData.selectedEntityId,
        entityType: formData.selectedEntityType,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          העלאת מסמך
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>העלאת מסמך חדש</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file" className="text-right">בחר קובץ</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="text-right cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-right">שם המסמך</Label>
            <Input
              id="name"
              value={formData.documentName}
              onChange={(e) => onFormChange({ documentName: e.target.value })}
              placeholder="שם המסמך"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-right">סוג המסמך</Label>
            <Select 
              value={formData.documentType} 
              onValueChange={(value) => onFormChange({ documentType: value })}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר סוג מסמך" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="contract">חוזה</SelectItem>
                <SelectItem value="quote">הצעת מחיר</SelectItem>
                <SelectItem value="invoice">חשבונית</SelectItem>
                <SelectItem value="receipt">קבלה</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!entityId && (
            <>
              <div>
                <Label htmlFor="entityType" className="text-right">קשר ל</Label>
                <Select 
                  value={formData.selectedEntityType || ""} 
                  onValueChange={(value) => onFormChange({ 
                    selectedEntityType: value || null,
                    selectedEntityId: null 
                  })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="בחר סוג ישות" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="lead">לקוח פוטנציאלי</SelectItem>
                    <SelectItem value="car">רכב</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.selectedEntityType === 'lead' && (
                <div>
                  <Label htmlFor="lead" className="text-right">בחר לקוח</Label>
                  <Select 
                    value={formData.selectedEntityId || ""} 
                    onValueChange={(value) => onFormChange({ selectedEntityId: value || null })}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר לקוח" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {isLeadsLoading ? (
                        <SelectItem value="" disabled>טוען...</SelectItem>
                      ) : (
                        leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.selectedEntityType === 'car' && (
                <div>
                  <Label htmlFor="car" className="text-right">בחר רכב</Label>
                  <Select 
                    value={formData.selectedEntityId || ""} 
                    onValueChange={(value) => onFormChange({ selectedEntityId: value || null })}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר רכב" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {isCarsLoading ? (
                        <SelectItem value="" disabled>טוען...</SelectItem>
                      ) : (
                        cars.map((car) => (
                          <SelectItem key={car.id} value={car.id}>
                            {car.make} {car.model} ({car.year})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onReset();
                onOpenChange(false);
              }}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || isSubmitting || !formData.file || !formData.documentName}
              className="flex-1"
            >
              {(isUploading || isSubmitting) ? (
                <>
                  <Upload className="h-4 w-4 ml-2 animate-spin" />
                  מעלה...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-2" />
                  העלה
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
