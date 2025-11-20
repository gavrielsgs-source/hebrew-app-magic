import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function useCustomerRelatedDocuments(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-related-documents', customerId, user?.id],
    queryFn: async () => {
      if (!user || !customerId) return [];

      // First, get the customer's phone number
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('phone')
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
      let leadDocs = [];
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

      // Combine and deduplicate documents
      const allDocs = [...(customerDocs || []), ...leadDocs];
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
