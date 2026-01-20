import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadProductionDocumentParams {
  pdfBlob: Blob;
  documentType: 'price_quote' | 'tax_invoice' | 'tax_invoice_receipt' | 'sales_agreement' | 'receipt' | 'tax_invoice_credit';
  documentNumber: string;
  customerName: string;
  entityType?: string;
  entityId?: string;
}

export function useUploadProductionDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadProductionDocumentParams): Promise<string> => {
      const { pdfBlob, documentType, documentNumber, customerName, entityType, entityId } = params;

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Create unique filename with timestamp (ASCII only for compatibility)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedCustomer = customerName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const fileName = `${documentType}-${documentNumber}-${sanitizedCustomer || 'customer'}-${timestamp}.pdf`;
      const filePath = `${userData.user.id}/${fileName}`;

      // Upload PDF to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload document: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Save metadata to documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: `${getDocumentTypeName(documentType)} - ${documentNumber}`,
          type: documentType,
          entity_type: entityType || null,
          entity_id: entityId || null,
          url: urlData.publicUrl,
          file_path: filePath,
          file_type: 'application/pdf',
          user_id: userData.user.id
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Try to cleanup uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Failed to save document metadata: ${dbError.message}`);
      }

      return urlData.publicUrl;
    },
    onSuccess: (publicUrl) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "המסמך הועלה בהצלחה",
        description: "המסמך נשמר בענן וניתן לשיתוף",
      });
    },
    onError: (error) => {
      console.error('Error uploading production document:', error);
      toast({
        title: "שגיאה בהעלאת המסמך",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  });
}

function getDocumentTypeName(type: string): string {
  const names: Record<string, string> = {
    price_quote: 'הצעת מחיר',
    tax_invoice: 'חשבונית מס',
    tax_invoice_receipt: 'חשבונית מס קבלה',
    sales_agreement: 'הסכם מכר'
  };
  return names[type] || type;
}
