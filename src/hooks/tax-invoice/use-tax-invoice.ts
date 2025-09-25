import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { TaxInvoiceData } from '@/types/tax-invoice';

export function useTaxInvoice() {
  const queryClient = useQueryClient();

  const createTaxInvoice = useMutation({
    mutationFn: async (invoiceData: Omit<TaxInvoiceData, 'invoiceNumber'>): Promise<TaxInvoiceData> => {
      // Get next invoice number
      const { data: numberData, error: numberError } = await supabase.functions.invoke('get-next-document-number', {
        body: { documentType: 'tax_invoice', prefix: '' }
      });

      if (numberError) {
        throw new Error('Failed to generate invoice number: ' + numberError.message);
      }

      const invoiceNumber = numberData.documentNumber;

      // Save invoice to database
      const { data, error } = await supabase
        .from('tax_invoices')
        .insert({
          invoice_number: invoiceNumber,
          date: invoiceData.date,
          title: invoiceData.title,
          currency: invoiceData.currency,
          lead_id: invoiceData.leadId || null,
          car_id: invoiceData.carId || null,
          subtotal: invoiceData.subtotal,
          vat_amount: invoiceData.vatAmount,
          total_amount: invoiceData.totalAmount,
          company_name: invoiceData.company.name,
          company_address: invoiceData.company.address,
          company_hp: invoiceData.company.hp,
          company_phone: invoiceData.company.phone,
          company_authorized_dealer: invoiceData.company.authorizedDealer,
          customer_name: invoiceData.customer.name,
          customer_address: invoiceData.customer.address,
          customer_hp: invoiceData.customer.hp,
          customer_phone: invoiceData.customer.phone,
          items: invoiceData.items as any,
          notes: invoiceData.notes || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to save invoice: ' + error.message);
      }

      // Also save as document for document management
      await supabase
        .from('documents')
        .insert({
          name: `${invoiceData.title} - ${invoiceNumber}`,
          type: 'tax_invoice',
          entity_id: invoiceData.leadId || invoiceData.carId || null,
          entity_type: invoiceData.leadId ? 'lead' : invoiceData.carId ? 'car' : null,
          url: `/tax-invoice/${data.id}`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      return {
        ...invoiceData,
        invoiceNumber
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => {
      console.error('Error creating tax invoice:', error);
      toast({
        title: "שגיאה ביצירת החשבונית",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
    }
  });

  const getTaxInvoices = useQuery({
    queryKey: ['tax-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch tax invoices: ' + error.message);
      }

      return data || [];
    }
  });

  const getTaxInvoice = (id: string) => useQuery({
    queryKey: ['tax-invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error('Failed to fetch tax invoice: ' + error.message);
      }

      return data;
    },
    enabled: !!id
  });

  return {
    createTaxInvoice: createTaxInvoice.mutateAsync,
    isCreating: createTaxInvoice.isPending,
    taxInvoices: getTaxInvoices.data || [],
    isLoading: getTaxInvoices.isLoading,
    getTaxInvoice
  };
}