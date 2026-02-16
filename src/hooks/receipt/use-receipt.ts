import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { ReceiptData } from '@/types/receipt';

export function useReceipt() {
  const queryClient = useQueryClient();

  const createReceipt = useMutation({
    mutationFn: async (receiptData: Omit<ReceiptData, 'receiptNumber'>): Promise<ReceiptData> => {
      // Get next receipt number
      const { data: numberData, error: numberError } = await supabase.functions.invoke('get-next-document-number', {
        body: { documentType: 'receipt', prefix: 'REC' }
      });

      if (numberError) {
        throw new Error('Failed to generate receipt number: ' + numberError.message);
      }

      const receiptNumber = numberData.documentNumber;

      // Save as document for document management
      await supabase
        .from('documents')
        .insert({
          name: `קבלה - ${receiptNumber}`,
          type: 'receipt',
          entity_id: receiptData.customerId || receiptData.leadId || receiptData.carId || null,
          entity_type: receiptData.customerId ? 'customer' : receiptData.leadId ? 'lead' : receiptData.carId ? 'car' : null,
          url: `/document-production/receipt`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      return {
        ...receiptData,
        receiptNumber
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['customer-related-documents'] });
    },
    onError: (error) => {
      console.error('Error creating receipt:', error);
      toast({
        title: "שגיאה ביצירת קבלה",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  });

  return {
    createReceipt: createReceipt.mutateAsync,
    isCreating: createReceipt.isPending,
  };
}
