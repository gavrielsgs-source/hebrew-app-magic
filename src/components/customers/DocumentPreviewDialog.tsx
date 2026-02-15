import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DocumentPreviewDialogProps {
  documentId: string;
  documentTitle: string;
  documentType: string;
  trigger?: React.ReactNode;
}

export function DocumentPreviewDialog({ 
  documentId, 
  documentTitle, 
  documentType,
  trigger 
}: DocumentPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generatePreview = async () => {
    try {
      setLoading(true);
      
      // Get document data
      const { data: docData, error: docError } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError || !docData) {
        throw new Error('לא ניתן לטעון את המסמך');
      }

      // Generate preview based on document type
      let previewContent = '';
      
      if (documentType === 'contract') {
        previewContent = `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 24px; font-weight: bold;">הסכם מכר</h1>
              <p style="font-size: 16px; color: #666;">מסמך מספר: ${docData.document_number}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">${docData.title}</h2>
              <p style="line-height: 1.6;">
                הסכם זה נחתם ביום ${new Date(docData.date || docData.created_at).toLocaleDateString('he-IL')}
              </p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 16px; font-weight: bold;">פרטים כלליים:</h3>
              <ul style="list-style: none; padding-right: 20px;">
                <li><strong>סוג מסמך:</strong> ${docData.type}</li>
                <li><strong>סכום:</strong> ${docData.amount ? `₪${docData.amount.toLocaleString()}` : 'לא צוין'}</li>
                <li><strong>סטטוס:</strong> ${docData.status}</li>
              </ul>
            </div>

            <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px;">
              <p style="text-align: center; color: #666; font-size: 14px;">
                מסמך זה נוצר אוטומטית במערכת
              </p>
            </div>
          </div>
        `;
      } else {
        previewContent = `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 24px; font-weight: bold;">${docData.title}</h1>
              <p style="font-size: 16px; color: #666;">מסמך מספר: ${docData.document_number}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 16px; font-weight: bold;">פרטי המסמך:</h3>
              <ul style="list-style: none; padding-right: 20px;">
                <li><strong>סוג מסמך:</strong> ${docData.type}</li>
                <li><strong>תאריך:</strong> ${new Date(docData.date || docData.created_at).toLocaleDateString('he-IL')}</li>
                <li><strong>סכום:</strong> ${docData.amount ? `₪${docData.amount.toLocaleString()}` : 'לא צוין'}</li>
                <li><strong>סטטוס:</strong> ${docData.status}</li>
              </ul>
            </div>

            <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px;">
              <p style="text-align: center; color: #666; font-size: 14px;">
                מסמך זה נוצר אוטומטית במערכת
              </p>
            </div>
          </div>
        `;
      }

      // Create blob URL for preview
      const blob = new Blob([previewContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('שגיאה ביצירת התצוגה המקדימה');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !previewUrl) {
      generatePreview();
    }
  }, [open]);

  useEffect(() => {
    // Cleanup blob URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // Check if PDF already exists in storage
      const { data: docData } = await supabase
        .from('customer_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (docData?.file_path) {
        // Download existing PDF from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('customer-documents')
          .download(docData.file_path);

        if (downloadError) throw downloadError;

        // Create download link
        const url = URL.createObjectURL(fileData);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('המסמך הורד בהצלחה');
      } else {
        // Generate PDF from preview content
        if (!previewUrl) {
          await generatePreview();
        }

        // Create a temporary element for PDF generation
        const element = document.createElement('div');
        element.innerHTML = await fetch(previewUrl!).then(r => r.text());
        element.style.direction = 'rtl';
        element.style.fontFamily = 'Arial, sans-serif';

        // Generate PDF
        const opt = {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 794,
          width: 794,
        };

        const canvas = await html2canvas(element, opt);
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
        const pdfBlob = pdf.output('blob');

        // Upload to storage
        const fileName = `${documentId}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('customer-documents')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Update document record with file path
        await supabase
          .from('customer_documents')
          .update({ file_path: fileName })
          .eq('id', documentId);

        // Download the generated PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('המסמך נוצר והורד בהצלחה');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('שגיאה בהורדת המסמך');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg" className="rounded-xl text-base px-6 hover:bg-blue-50 hover:border-blue-300">
            <Eye className="h-5 w-5 ml-2" />
            תצוגה מקדימה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {documentTitle}
          </DialogTitle>
          <DialogDescription className="text-right">
            תצוגה מקדימה של המסמך
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">טוען תצוגה מקדימה...</span>
            </div>
          ) : previewUrl ? (
            <>
              <div className="border rounded-lg overflow-hidden bg-white" style={{ maxHeight: '60vh' }}>
                <iframe
                  src={previewUrl}
                  className="w-full"
                  style={{ minHeight: '60vh', height: '60vh' }}
                  title="Document Preview"
                />
              </div>
              
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  סגור
                </Button>
                <Button onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  הורד מסמך
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">לא ניתן ליצור תצוגה מקדימה</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}