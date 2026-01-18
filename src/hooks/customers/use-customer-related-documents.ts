import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function useCustomerRelatedDocuments(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-related-documents', customerId, user?.id],
    queryFn: async () => {
      if (!user || !customerId) return [];

      // First, get the customer's phone number and name
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('phone, full_name')
        .eq('id', customerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        throw customerError;
      }

      if (!customer) {
        return [];
      }

      // Get documents directly linked to the customer
      const { data: customerDocs, error: customerDocsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('entity_type', 'customer')
        .eq('entity_id', customerId)
        .order('created_at', { ascending: false });

      if (customerDocsError) {
        console.error('Error fetching customer documents:', customerDocsError);
        throw customerDocsError;
      }

      // Get documents linked to leads with the same phone number
      let leadDocs: any[] = [];
      if (customer.phone) {
        // First, find leads with the same phone number
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id')
          .eq('user_id', user.id)
          .eq('phone', customer.phone);

        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
          throw leadsError;
        }

        if (leads && leads.length > 0) {
          const leadIds = leads.map(lead => lead.id);
          
          // Get documents linked to these leads
          const { data: leadDocsData, error: leadDocsError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .eq('entity_type', 'lead')
            .in('entity_id', leadIds)
            .order('created_at', { ascending: false });

          if (leadDocsError) {
            console.error('Error fetching lead documents:', leadDocsError);
            throw leadDocsError;
          }

          leadDocs = leadDocsData || [];
        }
      }

      // Get tax invoices linked to this customer by phone or name
      let taxInvoiceDocs: any[] = [];
      if (customer.phone || customer.full_name) {
        // Build query to find tax invoices by customer phone or name
        let taxInvoiceQuery = supabase
          .from('tax_invoices')
          .select('id, invoice_number, title, total_amount, date, created_at, customer_name, customer_phone')
          .eq('user_id', user.id);
        
        // Search by phone OR name
        if (customer.phone && customer.full_name) {
          taxInvoiceQuery = taxInvoiceQuery.or(`customer_phone.eq.${customer.phone},customer_name.ilike.%${customer.full_name}%`);
        } else if (customer.phone) {
          taxInvoiceQuery = taxInvoiceQuery.eq('customer_phone', customer.phone);
        } else if (customer.full_name) {
          taxInvoiceQuery = taxInvoiceQuery.ilike('customer_name', `%${customer.full_name}%`);
        }

        const { data: taxInvoices, error: taxInvoicesError } = await taxInvoiceQuery.order('created_at', { ascending: false });

        if (taxInvoicesError) {
          console.error('Error fetching tax invoices:', taxInvoicesError);
          // Don't throw, just continue without tax invoices
        } else {
          // Transform tax invoices to document-like structure
          taxInvoiceDocs = (taxInvoices || []).map(invoice => ({
            id: invoice.id,
            name: invoice.title || `חשבונית מס ${invoice.invoice_number}`,
            type: 'tax_invoice',
            url: `/tax-invoice/${invoice.id}`,
            created_at: invoice.created_at,
            entity_type: 'tax_invoice',
            entity_id: invoice.id,
            amount: invoice.total_amount
          }));
        }
      }

      // Combine and deduplicate documents
      const allDocs = [...(customerDocs || []), ...leadDocs, ...taxInvoiceDocs];
      const uniqueDocs = allDocs.filter((doc, index, self) =>
        index === self.findIndex((d) => d.id === doc.id)
      );

      // Sort by created_at descending
      uniqueDocs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('Fetched customer related documents:', uniqueDocs);
      return uniqueDocs;
    },
    enabled: !!user && !!customerId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
