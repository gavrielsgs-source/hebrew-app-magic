import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { NewCarOrderPDFData } from '@/utils/pdf/new-car-order-pdf';

export function useNewCarOrder() {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: async (orderData: Omit<NewCarOrderPDFData, 'orderNumber'>): Promise<NewCarOrderPDFData> => {
      const { data: numberData, error: numberError } = await supabase.functions.invoke('get-next-document-number', {
        body: { documentType: 'new_car_order', prefix: 'NCO' }
      });

      if (numberError) {
        throw new Error('Failed to generate order number: ' + numberError.message);
      }

      const orderNumber = numberData.documentNumber;

      await supabase
        .from('documents')
        .insert({
          name: `הזמנת רכב חדש - ${orderNumber}`,
          type: 'new_car_order',
          entity_id: null,
          entity_type: null,
          url: `/document-production/new-car-order`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      return {
        ...orderData,
        orderNumber
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error('Error creating car order:', error);
      toast({
        title: "שגיאה ביצירת הזמנת הרכב",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  });

  return {
    createOrder: createOrder.mutateAsync,
    isCreating: createOrder.isPending,
  };
}
