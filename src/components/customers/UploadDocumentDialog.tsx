import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface UploadDocumentDialogProps {
  customerId: string;
  documentId: string;
  onUploadComplete?: () => void;
  trigger?: React.ReactNode;
}

export function UploadDocumentDialog({ 
  customerId, 
  documentId,
  onUploadComplete,
  trigger 
}: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('קובץ גדול מדי. מקסימום 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('סוג קובץ לא נתמך. נתמכים: PDF, JPG, PNG');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setUploading(true);

      // Create a unique file name
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${customerId}/${documentId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('customer-documents')
        .getPublicUrl(fileName);

      // Create a record in customer_document_returns
      const { error: dbError } = await supabase
        .from('customer_document_returns')
        .insert({
          customer_document_id: documentId,
          file_path: publicUrl,
        });

      if (dbError) {
        throw dbError;
      }

      toast.success('המסמך הועלה בהצלחה');
      setOpen(false);
      setSelectedFile(null);
      onUploadComplete?.();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('שגיאה בהעלאת המסמך');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg" className="rounded-xl text-base px-6 hover:bg-purple-50 hover:border-purple-300">
            <Upload className="h-5 w-5 ml-2" />
            העלה מסמך חתום
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">העלאת מסמך חתום</DialogTitle>
          <DialogDescription className="text-right">
            העלה מסמך חתום או מעודכן מהלקוח
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">בחר קובץ</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="text-right"
            />
            <p className="text-xs text-muted-foreground text-right">
              נתמכים: PDF, JPG, PNG (עד 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'מעלה...' : 'העלה מסמך'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}