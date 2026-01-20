import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { TaxInvoiceCreditData, OriginalInvoice } from '@/types/tax-invoice-credit';

export function useTaxInvoiceCredit() {
  const queryClient = useQueryClient();

  const createTaxInvoiceCredit = useMutation({
    mutationFn: async (creditData: Omit<TaxInvoiceCreditData, 'creditInvoiceNumber'>): Promise<TaxInvoiceCreditData> => {
      // Get next credit invoice number
      const { data: numberData, error: numberError } = await supabase.functions.invoke('get-next-document-number', {
        body: { documentType: 'tax_invoice_credit', prefix: 'TIC' }
      });

      if (numberError) {
        throw new Error('Failed to generate credit invoice number: ' + numberError.message);
      }

      const creditInvoiceNumber = numberData.documentNumber;

      // Save as document for document management
      await supabase
        .from('documents')
        .insert({
          name: `חשבונית מס זיכוי - ${creditInvoiceNumber}`,
          type: 'tax_invoice_credit',
          entity_id: creditData.customerId || creditData.leadId || creditData.carId || null,
          entity_type: creditData.customerId ? 'customer' : creditData.leadId ? 'lead' : creditData.carId ? 'car' : null,
          url: `/document-production/tax-invoice-credit`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      return {
        ...creditData,
        creditInvoiceNumber
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-invoice-credits'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error('Error creating tax invoice credit:', error);
      toast({
        title: "שגיאה ביצירת חשבונית מס זיכוי",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  });

  // Fetch tax invoices for a customer within date range
  const useFetchOriginalInvoices = (
    customerId: string | null,
    fromDate: Date | null,
    toDate: Date | null,
    creditForType: 'tax_invoice' | 'tax_invoice_receipt'
  ) => {
    return useQuery({
      queryKey: ['original-invoices', customerId, fromDate?.toISOString(), toDate?.toISOString(), creditForType],
      queryFn: async (): Promise<OriginalInvoice[]> => {
        if (!customerId) return [];

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];

        // Format dates for query
        const fromDateStr = fromDate ? fromDate.toISOString().split('T')[0] : null;
        const toDateStr = toDate ? toDate.toISOString().split('T')[0] : null;

        // Get customer info to match by name/phone
        const { data: customer } = await supabase
          .from('customers')
          .select('full_name, phone')
          .eq('id', customerId)
          .single();

        if (!customer) return [];

        // Fetch tax invoices
        let query = supabase
          .from('tax_invoices')
          .select('id, invoice_number, date, total_amount, customer_name')
          .eq('user_id', user.user.id)
          .or(`customer_name.ilike.%${customer.full_name}%,customer_phone.eq.${customer.phone}`);

        if (fromDateStr) {
          query = query.gte('date', fromDateStr);
        }
        if (toDateStr) {
          query = query.lte('date', toDateStr);
        }

        const { data: invoices, error } = await query.order('date', { ascending: false });

        if (error) {
          console.error('Error fetching invoices:', error);
          return [];
        }

        return (invoices || []).map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          date: inv.date,
          totalAmount: inv.total_amount,
          customerName: inv.customer_name,
          type: creditForType
        }));
      },
      enabled: !!customerId && !!fromDate && !!toDate
    });
  };

  return {
    createTaxInvoiceCredit: createTaxInvoiceCredit.mutateAsync,
    isCreating: createTaxInvoiceCredit.isPending,
    useFetchOriginalInvoices
  };
}
