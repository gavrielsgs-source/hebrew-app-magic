import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { TaxInvoiceReceiptData } from '@/types/tax-invoice-receipt';

export function useTaxInvoiceReceipt() {
  const queryClient = useQueryClient();

  const createTaxInvoiceReceipt = useMutation({
    mutationFn: async (receiptData: Omit<TaxInvoiceReceiptData, 'invoiceNumber'>): Promise<TaxInvoiceReceiptData> => {
      // Get next invoice number
      const { data: numberData, error: numberError } = await supabase.functions.invoke('get-next-document-number', {
        body: { documentType: 'tax_invoice_receipt', prefix: 'TIR' }
      });

      if (numberError) {
        throw new Error('Failed to generate invoice number: ' + numberError.message);
      }

      const invoiceNumber = numberData.documentNumber;

      // Save as document for document management
      await supabase
        .from('documents')
        .insert({
          name: `חשבונית מס קבלה - ${invoiceNumber}`,
          type: 'tax_invoice_receipt',
          entity_id: receiptData.leadId || receiptData.carId || null,
          entity_type: receiptData.leadId ? 'lead' : receiptData.carId ? 'car' : null,
          url: `/document-production/tax-invoice-receipt`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      return {
        ...receiptData,
        invoiceNumber
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-invoice-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error('Error creating tax invoice receipt:', error);
      toast({
        title: "שגיאה ביצירת חשבונית מס קבלה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  });

  return {
    createTaxInvoiceReceipt: createTaxInvoiceReceipt.mutateAsync,
    isCreating: createTaxInvoiceReceipt.isPending,
  };
}
