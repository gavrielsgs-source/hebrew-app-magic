import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { CustomerDocument, CustomerDocumentReturn } from "@/types/customer";

export function useCustomerDocuments(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-documents', customerId, user?.id],
    queryFn: async (): Promise<CustomerDocument[]> => {
      if (!user || !customerId) return [];

      const { data, error } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer documents:', error);
        throw error;
      }

      return (data as CustomerDocument[]) || [];
    },
    enabled: !!user && !!customerId,
  });
}

export function useCustomerDocumentReturns(customerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-document-returns', customerId, user?.id],
    queryFn: async (): Promise<CustomerDocumentReturn[]> => {
      if (!user || !customerId) return [];

      const { data, error } = await supabase
        .from('customer_document_returns')
        .select(`
          *,
          customer_document:customer_documents(*)
        `)
        .eq('customer_document.customer_id', customerId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer document returns:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!customerId,
  });
}

export function useCreateCustomerDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      title: string;
      type: string;
      amount?: number;
      date?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Generate document number
      const { data: sequenceData, error: sequenceError } = await supabase
        .from('document_sequences')
        .select('current_number, prefix')
        .eq('user_id', user.id)
        .eq('document_type', data.type)
        .single();

      let documentNumber: string;
      let currentNumber: number;

      if (sequenceError || !sequenceData) {
        // Create new sequence
        currentNumber = 1;
        const prefix = data.type === 'invoice' ? 'INV' : 
                      data.type === 'contract' ? 'CON' : 
                      data.type === 'receipt' ? 'REC' : 'DOC';
        
        await supabase
          .from('document_sequences')
          .insert({
            user_id: user.id,
            document_type: data.type,
            prefix,
            current_number: currentNumber
          });

        documentNumber = `${prefix}-${currentNumber.toString().padStart(4, '0')}`;
      } else {
        currentNumber = sequenceData.current_number + 1;
        documentNumber = `${sequenceData.prefix}-${currentNumber.toString().padStart(4, '0')}`;

        // Update sequence
        await supabase
          .from('document_sequences')
          .update({ current_number: currentNumber })
          .eq('user_id', user.id)
          .eq('document_type', data.type);
      }

      const { data: result, error } = await supabase
        .from('customer_documents')
        .insert({
          customer_id: data.customerId,
          user_id: user.id,
          title: data.title,
          type: data.type,
          amount: data.amount,
          date: data.date || new Date().toISOString().split('T')[0],
          document_number: documentNumber,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['customer-documents', variables.customerId] 
      });
      toast.success('מסמך נוצר בהצלחה');
    },
    onError: (error) => {
      console.error('Error creating customer document:', error);
      toast.error('שגיאה ביצירת המסמך');
    },
  });
}

export function useUpdateCustomerDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      documentId: string;
      customerId: string;
      status: 'draft' | 'sent' | 'signed' | 'cancelled';
    }) => {
      const { data: result, error } = await supabase
        .from('customer_documents')
        .update({ status: data.status })
        .eq('id', data.documentId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['customer-documents', variables.customerId] 
      });
      toast.success('סטטוס המסמך עודכן בהצלחה');
    },
    onError: (error) => {
      console.error('Error updating document status:', error);
      toast.error('שגיאה בעדכון סטטוס המסמך');
    },
  });
}