
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { DocumentIcon } from "./DocumentIcon";
import type { DocumentFormData } from "../types";
import type { UploadDocumentParams } from "@/hooks/use-documents";

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: DocumentFormData;
  onFormChange: (data: Partial<DocumentFormData>) => void;
  onUpload: (params: UploadDocumentParams) => Promise<void>;
  onReset: () => void;
  isUploading: boolean;
  entityId?: string;
  entityType?: 'lead' | 'car' | 'agency';
  leads?: any[];
  cars?: any[];
  isLeadsLoading: boolean;
  isCarsLoading: boolean;
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
  leads,
  cars,
  isLeadsLoading,
  isCarsLoading
}: UploadDocumentDialogProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      onFormChange({ 
        file: selectedFile,
        documentName: !formData.documentName ? selectedFile.name.split('.')[0] : formData.documentName
      });
    }
  };

  const handleUpload = async () => {
    if (!formData.file) {
      toast.error("יש לבחור קובץ");
      return;
    }
    
    if (!formData.documentName) {
      toast.error("יש להזין שם למסמך");
      return;
    }
    
    try {
      const params: UploadDocumentParams = {
        file: formData.file,
        name: formData.documentName,
        type: formData.documentType,
        entityId: formData.selectedEntityId || entityId,
        entityType: formData.selectedEntityType || entityType,
      };
      
      await onUpload(params);
      toast.success("המסמך הועלה בהצלחה");
      onOpenChange(false);
      onReset();
    } catch (error) {
      toast.error("שגיאה בהעלאת המסמך");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Upload className="h-4 w-4 ml-1" />
          העלאת מסמך
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>העלאת מסמך חדש</DialogTitle>
          <DialogDescription>
            העלה מסמכים כמו חוזים, רישיונות, חשבוניות ועוד.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentName" className="block text-right">שם המסמך</Label>
            <Input
              id="documentName"
              value={formData.documentName}
              onChange={(e) => onFormChange({ documentName: e.target.value })}
              placeholder="לדוגמה: חוזה מכירה - יונדאי i10"
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentType" className="block text-right">סוג המסמך</Label>
            <Select 
              value={formData.documentType} 
              onValueChange={(value) => onFormChange({ documentType: value })}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="בחר סוג מסמך" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="contract">חוזה</SelectItem>
                <SelectItem value="id">תעודת זהות</SelectItem>
                <SelectItem value="license">רישיון</SelectItem>
                <SelectItem value="invoice">חשבונית</SelectItem>
                <SelectItem value="insurance">ביטוח</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!entityId && !entityType && (
            <>
              <div className="space-y-2">
                <Label htmlFor="entityType" className="block text-right">שייך מסמך אל</Label>
                <Select 
                  value={formData.selectedEntityType || "none"} 
                  onValueChange={(value) => onFormChange({
                    selectedEntityId: null,
                    selectedEntityType: value === "none" ? null : value as 'lead' | 'car' | 'agency'
                  })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="בחר סוג ישות" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="none">לא משויך</SelectItem>
                    <SelectItem value="lead">לקוח</SelectItem>
                    <SelectItem value="car">רכב</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.selectedEntityType === 'lead' && (
                <div className="space-y-2">
                  <Label htmlFor="leadId" className="block text-right">בחר לקוח</Label>
                  <Select 
                    value={formData.selectedEntityId || ""} 
                    onValueChange={(value) => onFormChange({ selectedEntityId: value })}
                    disabled={isLeadsLoading}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר לקוח" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {leads?.map(lead => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name} {lead.phone ? `(${lead.phone})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLeadsLoading && <p className="text-sm text-muted-foreground text-right">טוען לקוחות...</p>}
                </div>
              )}
              
              {formData.selectedEntityType === 'car' && (
                <div className="space-y-2">
                  <Label htmlFor="carId" className="block text-right">בחר רכב</Label>
                  <Select 
                    value={formData.selectedEntityId || ""} 
                    onValueChange={(value) => onFormChange({ selectedEntityId: value })}
                    disabled={isCarsLoading}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר רכב" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {cars?.map(car => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.make} {car.model} {car.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCarsLoading && <p className="text-sm text-muted-foreground text-right">טוען רכבים...</p>}
                </div>
              )}
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="file" className="block text-right">קובץ</Label>
            <div className="border rounded-lg p-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {formData.file ? (
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onFormChange({ file: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="truncate">{formData.file.name}</span>
                    <DocumentIcon fileType={formData.file.type} />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Label htmlFor="file" className="cursor-pointer block">
                    <div className="py-4 flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <span>לחץ לבחירת קובץ או גרור לכאן</span>
                      <span className="text-xs">
                        PDF, תמונות ומסמכי משרד נתמכים
                      </span>
                    </div>
                  </Label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onReset}>איפוס</Button>
          <Button 
            onClick={handleUpload}
            disabled={!formData.file || !formData.documentName || isUploading || (formData.selectedEntityType && !formData.selectedEntityId)}
          >
            {isUploading ? "מעלה..." : "העלאה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
