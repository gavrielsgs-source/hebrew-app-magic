import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { PriceQuoteData } from '@/types/document-production';

export function usePriceQuote() {
  const queryClient = useQueryClient();

  const createPriceQuote = useMutation({
    mutationFn: async (quoteData: Omit<PriceQuoteData, 'quoteNumber'>): Promise<PriceQuoteData> => {
      // Get next quote number
      const { data: numberData, error: numberError } = await supabase.functions.invoke('get-next-document-number', {
        body: { documentType: 'price_quote', prefix: 'PQ' }
      });

      if (numberError) {
        throw new Error('Failed to generate quote number: ' + numberError.message);
      }

      const quoteNumber = numberData.documentNumber;

      // Save as document for document management
      await supabase
        .from('documents')
        .insert({
          name: `הצעת מחיר - ${quoteNumber}`,
          type: 'price_quote',
          entity_id: null,
          entity_type: null,
          url: `/document-production/price-quote`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      return {
        ...quoteData,
        quoteNumber
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error('Error creating price quote:', error);
      toast({
        title: "שגיאה ביצירת הצעת המחיר",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  });

  return {
    createPriceQuote: createPriceQuote.mutateAsync,
    isCreating: createPriceQuote.isPending,
  };
}